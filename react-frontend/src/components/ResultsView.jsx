import { useRef, useEffect } from 'react'
import GeminiAnalysis from './GeminiAnalysis'

export default function ResultsView({ image, results, loading, error, onReset }) {
    const canvasRef = useRef(null)
    const imageRef = useRef(null)

    // Draw detections when results change
    useEffect(() => {
        if (!image || !canvasRef.current) return

        const img = new Image()
        img.onload = () => {
            imageRef.current = img
            drawCanvas(img, results?.detections || [])
        }
        img.src = image
    }, [image, results])

    const drawCanvas = (img, detections) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')

        // Set canvas size
        const maxWidth = canvas.parentElement.clientWidth
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Draw detections
        const scaleX = canvas.width / img.width
        const scaleY = canvas.height / img.height

        detections.forEach((det, idx) => {
            const [x1, y1, x2, y2] = det.bbox
            const sx1 = x1 * scaleX
            const sy1 = y1 * scaleY
            const sx2 = x2 * scaleX
            const sy2 = y2 * scaleY

            // Box
            ctx.strokeStyle = '#38ef7d'
            ctx.lineWidth = 3
            ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1)

            // Label
            const label = `#${det.id}: ${(det.confidence * 100).toFixed(1)}%`
            ctx.font = '14px Inter, sans-serif'
            const textWidth = ctx.measureText(label).width

            ctx.fillStyle = '#38ef7d'
            ctx.fillRect(sx1, sy1 - 20, textWidth + 10, 20)

            ctx.fillStyle = '#000'
            ctx.fillText(label, sx1 + 5, sy1 - 5)
        })
    }

    const detections = results?.detections || []
    const avgConfidence = detections.length > 0
        ? (detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length * 100).toFixed(0)
        : null

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Image Panel */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Detection Results</h2>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            New Image
                        </button>
                    </div>

                    <div className="relative bg-black/30 rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
                        <canvas ref={canvasRef} className="max-w-full" />

                        {/* Loading Overlay */}
                        {loading && (
                            <div className="absolute inset-0 bg-dark-primary/90 flex flex-col items-center justify-center gap-4">
                                <div className="w-12 h-12 border-3 border-white/10 border-t-primary-500 rounded-full animate-spin" />
                                <p className="text-gray-400">Analyzing image...</p>
                            </div>
                        )}

                        {/* Error Overlay */}
                        {error && (
                            <div className="absolute inset-0 bg-dark-primary/90 flex flex-col items-center justify-center gap-4 p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-red-400 font-medium">Detection Failed</p>
                                <p className="text-gray-500 text-sm max-w-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Panel */}
                <div className="glass-card p-6 h-fit">
                    <h3 className="text-lg font-semibold mb-6">Detection Summary</h3>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="glass p-4 rounded-xl text-center">
                            <span className="block text-3xl font-bold gradient-accent bg-clip-text text-transparent">
                                {loading ? '...' : detections.length}
                            </span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Detected
                            </span>
                        </div>
                        <div className="glass p-4 rounded-xl text-center">
                            <span className="block text-3xl font-bold gradient-accent bg-clip-text text-transparent">
                                {loading ? '...' : avgConfidence ? `${avgConfidence}%` : '-'}
                            </span>
                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Avg Confidence
                            </span>
                        </div>
                    </div>

                    {/* Detections List */}
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                        Detections
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center text-gray-500 py-8">
                                <div className="w-6 h-6 border-2 border-white/10 border-t-primary-500 rounded-full animate-spin mx-auto mb-2" />
                                Analyzing...
                            </div>
                        ) : detections.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No microplastics detected
                            </div>
                        ) : (
                            detections.map((det) => (
                                <div
                                    key={det.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border-l-3 border-accent-400"
                                >
                                    <span className="font-medium text-accent-400">
                                        Microplastic #{det.id}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">
                                            {(det.confidence * 100).toFixed(1)}%
                                        </span>
                                        <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full gradient-accent rounded-full transition-all"
                                                style={{ width: `${det.confidence * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <GeminiAnalysis results={results} image={image} />
        </div>
    )
}
