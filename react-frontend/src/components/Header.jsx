import ScrambledText from './ScrambledText';

export default function Header() {
    return (
        <header className="glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl animate-pulse-slow">🔬</span>
                        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                            <ScrambledText
                                scrambleChars="!<>-_/[]{}—=+*^?#________"
                                duration={1.5}
                                speed={0.5}
                            >
                                Microplastic Detector
                            </ScrambledText>
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm sm:text-base">
                        AI-Powered Detection using Faster R-CNN
                    </p>
                </div>
            </div>
        </header>
    )
}
