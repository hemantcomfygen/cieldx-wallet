function WalletHeaderSkeleton() {
    return (
        <div className="p-4 border-b border-borderColor">
            <div className="bg-card-bg rounded-xl overflow-hidden border border-borderColor animate-pulse">
                <div className="w-full flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-6.5 h-6.5 bg-zinc-700 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 w-28 bg-zinc-700 rounded" />
                            <div className="h-3 w-12 bg-zinc-700 rounded" />
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-4 space-y-3">
                    <div className="border-l-2 border-zinc-700 pl-3 space-y-2">
                        <div className="h-3 w-20 bg-zinc-700 rounded" />
                        <div className="h-7 w-32 bg-zinc-700 rounded" />
                    </div>
                    <div className="h-8 w-full bg-zinc-700 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export default WalletHeaderSkeleton;