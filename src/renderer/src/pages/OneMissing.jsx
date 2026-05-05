import React, { useRef, useState } from 'react'
import CustomButton from '../components/Buttons/CustomButton';
import { useNavigate } from 'react-router-dom';
import { Fade } from 'react-awesome-reveal';
import Input from '../components/Input/Input';
import toast from 'react-hot-toast';
import { oneMissingPassPhrase } from '../blockchain/oneMissing/oneMissingPassPhrase';

const passphraseLengths = [12, 15, 18, 21, 24];

const OneMissing = () => {
    const [passphrase, setPassphrase] = useState("")
    const [error, setError] = useState("")
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState({
        checked: 0,
        valid: 0,
        found: 0
    });

    const navigate = useNavigate();
    const stopRef = useRef(false);

    const handleGenerateCombination = async () => {
        try {
            stopRef.current = false;

            const length = passphrase.trim().split(" ").length;
            if (!passphraseLengths.includes(length)) {
                toast.error("Invalid passphrase length !");
                setError("Passphrase length should be 12, 15, 18, 21, 24 words");
                return;
            }
            setLoading(true);
            setResults([]);

            const res = await oneMissingPassPhrase(
                passphrase,
                (data) => {
                    setProgress(data);
                },
                (mnemonic) => {
                    setResults(prev => [...prev, mnemonic]);
                },
                stopRef
            );

            if (res?.message) {
                toast.error(res?.message || "Something went wrong!");
            }

        } catch (error) {
            console.log("error in find combination", error)
            toast.error(error?.message || "Something went wrong!")
        } finally {
            setLoading(false);
        }
    }

    const handleStop = () => {
        stopRef.current = true;
    };

    return (
        <>
            <Fade triggerOnce delay={100}>
                <div className=" bg-primaryTheme text-white">

                    <div className="max-w-7xl mx-auto px-6 py-4 space-y-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M12 4L6 10L12 16"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <div className="flex items-center justify-between w-full">
                                <h1 className="text-xl font-bold">Search Missing Word</h1>
                            </div>
                        </div>

                        <div className='space-y-6'>
                            <Input
                                type='textarea'
                                placeholder="Enter your passphrase without the missing word (????)"
                                value={passphrase}
                                onChange={(e) => {
                                    setPassphrase(e.target.value);
                                    setError("");
                                }}
                                error={error}
                            />

                            <div className='flex items-center gap-4'>
                                {loading && (
                                    <CustomButton
                                        label="Stop"
                                        variant="secondary"
                                        onClick={handleStop}
                                        disabled={!loading}
                                    />
                                )}

                                <CustomButton
                                    label={loading ? "Searching..." : "Find Combination"}
                                    onClick={() => handleGenerateCombination()}
                                    disabled={loading}
                                />
                            </div>

                            {/* {loading && ( */}
                            <div className="text-sm text-zinc-400 space-y-1">
                                <div>Checked: {progress.checked}</div>
                                <div>Valid Mnemonics: {progress.valid}</div>
                                <div>Found Balance: {progress.found}</div>
                            </div>
                            {/* )} */}

                            {results.length > 0 && (
                                <div className="bg-white/5 p-4 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h2 className="font-semibold">Found Wallet</h2>
                                        <span className="text-sm text-green-400">
                                            Count: {results.length}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {results.map((phrase, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-black/30 rounded-lg text-sm wrap-break-words flex gap-2"
                                            >
                                                <span className="text-green-400 font-semibold">
                                                    {index + 1}.
                                                </span>
                                                <span>{phrase}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div >
            </Fade>
        </>
    )
}

export default OneMissing;
