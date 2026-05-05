import React, { useEffect, useMemo, useState } from "react";

import NewsCard from "../components/Community/NewsCard.jsx";
import NewsCardSkeleton from "../components/Community/NewsCardSkeleton.jsx";
import CommunityToolbar from "../components/Community/CommunityToolbar.jsx";
import PaginationBar from "../components/Community/PaginationBar.jsx";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addPost, deletePost, findUniq, getAllPosts, updatePost } from "../redux/slices/AuthSlice.js";
import CreatePostModal from "../components/Community/CreatePostModal.jsx";
import CredentialsModal from "../components/Community/CredentialsModal.jsx";
import UserPostCard from "../components/Community/UserPostCard.jsx";
import { updateUserNamePasswordForPost } from "../blockchain/wallets/Wallet.js";
import { USER_ID } from "../utils/config.js";
import { decryptData } from "../utils/encryptionFunction.js";
import { getFromIndexDB } from "../utils/indexDB.js";
import { fetchCryptoNews } from "../utils/community.js";

const PAGE_SIZE = 10;
const POSTS_PAGE_SIZE = 6;
const POSTS_FETCH_SIZE = 100;

export default function Community() {
    const dispatch = useDispatch();
    const [query, setQuery] = useState("");
    const [serverQuery, setServerQuery] = useState("crypto OR blockchain");

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [pageTokens, setPageTokens] = useState([null]); // index -> token to fetch that page
    const [pageIndex, setPageIndex] = useState(0);
    const [nextPage, setNextPage] = useState(null);

    // user posts
    const [posts, setPosts] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState("");
    const [myUserName, setMyUserName] = useState("");

    // modals
    const [modalType, setModalType] = useState("add")
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCredOpen, setIsCredOpen] = useState(false);
    const [credError, setCredError] = useState("");
    const [credSaving, setCredSaving] = useState(false);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");
    const [formData, setFormData] = useState({
        id: "",
        title: "",
        thumbnail: "",
        description: ""
    })

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((n) => {
            const hay = `${n.title} ${n.description} ${n.source}`.toLowerCase();
            return hay.includes(q);
        });
    }, [items, query]);

    const canPrev = pageIndex > 0;
    const canNext = Boolean(nextPage);

    async function loadPosts() {
        setPostsLoading(true);
        setPostsError("");
        try {
            // get current user's saved username (to filter "your posts")
            const row = await getFromIndexDB("wallets", USER_ID);
            const user = row?.data ? decryptData(row.data) : null;
            const currentUserName = user?.userName?.userName || "";
            setMyUserName(currentUserName);

            const res = await dispatch(getAllPosts({ page: 1, size: POSTS_FETCH_SIZE })).unwrap();
            const list =
                (Array.isArray(res) ? res : null) ||
                (Array.isArray(res?.data) ? res.data : null) ||
                (Array.isArray(res?.data?.data) ? res.data.data : null) ||
                [];

            const normalized = list
                .filter(Boolean)
                .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

            setPosts(normalized);

            const mine = currentUserName
                ? normalized.filter((p) => (p?.userName || "").toLowerCase() === currentUserName.toLowerCase())
                : [];
            setMyPosts(mine);
        } catch (e) {
            setPosts([]);
            setMyPosts([]);
            setPostsError(typeof e === "string" ? e : "Failed to load posts");
        } finally {
            setPostsLoading(false);
        }
    }

    async function loadPage({ index, token, q }) {
        setLoading(true);
        setError("");

        const res = await fetchCryptoNews({
            page: token,
            pageSize: PAGE_SIZE,
            query: q,
        });

        if (!res.success) {
            setItems([]);
            setNextPage(null);
            setError(res.message || "Failed to load news");
            setLoading(false);
            return;
        }

        setItems(res.data || []);
        setNextPage(res.nextPage || null);

        setPageTokens((prev) => {
            const copy = [...prev];
            copy[index] = token ?? null;
            if (res.nextPage && !copy[index + 1]) copy[index + 1] = res.nextPage;
            return copy;
        });

        setLoading(false);
    }

    useEffect(() => {
        loadPage({ index: 0, token: null, q: serverQuery });
        setPageIndex(0);
        setPageTokens([null]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverQuery]);

    useEffect(() => {
        loadPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        const q = query.trim();
        setServerQuery(q ? q : "crypto OR blockchain");
    };

    const onPrev = () => {
        const idx = pageIndex - 1;
        const token = pageTokens[idx] ?? null;
        setPageIndex(idx);
        loadPage({ index: idx, token, q: serverQuery });
    };

    const onNext = () => {
        const idx = pageIndex + 1;
        const token = pageTokens[idx] ?? nextPage;
        if (!token) return;
        setPageIndex(idx);
        loadPage({ index: idx, token, q: serverQuery });
    };

    const onRefresh = () => {
        const token = pageTokens[pageIndex] ?? null;
        loadPage({ index: pageIndex, token, q: serverQuery });
    };

    const handleOnAddPost = async () => {
        const row = await getFromIndexDB("wallets", USER_ID);
        const user = decryptData(row.data);

        if (!user?.userName || !user?.userName.userName || !user?.userName.postPassword) {
            setIsCreateOpen(false);
            setIsCredOpen(true);
            return;
        }
        setPostError("");
        setIsCreateOpen(true);
    };

    const handleSaveCred = async ({ userName, password }) => {
        setCredSaving(true);
        setCredError("");
        try {
            const res = await dispatch(findUniq({ userName })).unwrap();
            const uniq = res?.data?.uniq ?? res?.data?.data?.uniq;
            if (uniq === true) {
                setCredError("Username already exists. Please choose a different one.");
                return;
            }
            await updateUserNamePasswordForPost({ userName, postPassword: password });
            toast.success("Community profile saved");
            setIsCredOpen(false);
            setIsCreateOpen(true);
        } catch (e) {
            setCredError(typeof e === "string" ? e : "Unable to validate username");
        } finally {
            setCredSaving(false);
        }
    };

    const handleSubmitPost = async (e) => {
        e.preventDefault();
        setPosting(true);
        setPostError("");

        try {
            const row = await getFromIndexDB("wallets", USER_ID);
            const user = decryptData(row.data);

            if (!user?.userName?.userName || !user?.userName?.postPassword) {
                setIsCreateOpen(false);
                setIsCredOpen(true);
                return;
            }

            const payload = {
                userName: user.userName.userName,
                title: formData?.title.trim(),
                description: formData?.description.trim(),
                thumbnail: formData?.thumbnail,
            };

            let response;
            const { userName, ...restPayload } = payload;
            if (modalType === "edit") {
                response = await dispatch(
                    updatePost({
                        id: formData?.id,
                        ...restPayload,
                    })
                ).unwrap();

                toast.success("Post updated");
            } else {
                response = await dispatch(
                    addPost(payload)
                ).unwrap();

                toast.success("Post added");
            }

            setIsCreateOpen(false);
            setModalType("add");

            setFormData({
                id: "",
                title: "",
                description: "",
                thumbnail: "",
            });

            await loadPosts();

        } catch (e) {
            console.error(e);
            setPostError(typeof e === "string" ? e : e?.message || "Failed");
        } finally {
            setPosting(false);
        }
    };

    const handleEditPostModal = (post) => {
        setModalType("edit");
        setIsCreateOpen(true);
        setFormData({
            id: post?._id,
            title: post?.title,
            description: post?.description,
            thumbnail: post?.thumbnail,
        });
    }

    const handleDeletePost = async (post) => {
        try {
            await dispatch(deletePost({ id: post?._id })).unwrap();
            toast.success("Post deleted");
            await loadPosts();
        } catch (e) {
            console.error(e);
            toast.error(typeof e === "string" ? e : e?.message || "Failed");
        }
    }

    const trendingPosts = useMemo(() => {
        // Trending section: show ALL posts from API (no filter)
        return posts;
    }, [posts]);

    return (
        <div className="p-6">
            <CommunityToolbar
                query={query}
                setQuery={setQuery}
                onSubmit={onSubmit}
                onRefresh={onRefresh}
                onAdd={handleOnAddPost}
            />

            <div className="mt-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    {myPosts.length > 0 && (
                        <div className="text-white font-semibold">
                            {myUserName ? `Your posts (${myUserName})` : "Your posts"}
                        </div>
                    )}

                </div>

                {postsError ? (
                    <div className="text-sm text-red-400 mt-3">{postsError}</div>
                ) : null}

                {myPosts.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {postsLoading ? (
                            Array.from({ length: POSTS_PAGE_SIZE }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-borderColor bg-white/5 overflow-hidden"
                                >
                                    <div className="h-40 bg-white/10 animate-pulse" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                                        <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                                        <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            myPosts.map((p) => <UserPostCard
                                key={p?._id || p?.id}
                                post={p}
                                isMyPost={true}
                                onEdit={handleEditPostModal}
                                onDelete={handleDeletePost}
                            />)
                        )}
                    </div>
                )}

            </div>

            <div className="h-8" />
            {trendingPosts.length > 0 && (
                <div className="mt-6">

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="text-white font-semibold">Trending posts</div>
                    </div>

                    {postsError ? (
                        <div className="text-sm text-red-400 mt-3">{postsError}</div>
                    ) : null}


                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {postsLoading ? (
                            Array.from({ length: POSTS_PAGE_SIZE }).map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-borderColor bg-white/5 overflow-hidden"
                                >
                                    <div className="h-40 bg-white/10 animate-pulse" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                                        <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                                        <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))
                        ) : trendingPosts.length === 0 ? (
                            <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-borderColor bg-white/5 p-8 text-center">
                                <div className="text-white font-semibold text-lg">No posts found</div>
                                <div className="text-gray-400 text-sm mt-2">Be the first to create a post.</div>
                            </div>
                        ) : (
                            trendingPosts.map((p) => <UserPostCard key={p?._id || p?.id} post={p} />)
                        )}
                    </div>
                </div>
            )}

            <div className="h-8" />

            <div className="mt-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="text-white font-semibold">Community posts</div>
                </div>

                {error ? (
                    <div className="text-sm text-red-400 mt-3">{error}</div>
                ) : null}

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading ? (
                        Array.from({ length: PAGE_SIZE }).map((_, i) => <NewsCardSkeleton key={i} />)
                    ) : filtered.length === 0 ? (
                        <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-borderColor bg-white/5 p-8 text-center">
                            <div className="text-white font-semibold text-lg">No news found</div>
                            <div className="text-gray-400 text-sm mt-2">Try a different search term or refresh.</div>
                        </div>
                    ) : (
                        filtered.map((item) => <NewsCard key={item.id} item={item} />)
                    )}
                </div>

                <div className="mt-6">
                    <PaginationBar
                        loading={loading}
                        error={error}
                        count={filtered.length}
                        isFiltered={Boolean(query.trim())}
                        pageIndex={pageIndex}
                        canPrev={canPrev}
                        canNext={canNext}
                        onPrev={onPrev}
                        onNext={onNext}
                    />
                </div>
            </div>

            <CredentialsModal
                isOpen={isCredOpen}
                onClose={() => setIsCredOpen(false)}
                onSave={handleSaveCred}
                loading={credSaving}
                error={credError}
            />

            <CreatePostModal
                isOpen={isCreateOpen}
                onClose={() => {
                    setPostError("");
                    setIsCreateOpen(false);
                }}
                onSubmit={(e) => handleSubmitPost(e)}
                uploading={posting}
                error={postError}
                formData={formData}
                setFormData={setFormData}
            />
        </div>
    );
}