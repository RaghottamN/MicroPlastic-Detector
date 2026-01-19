import { useCallback, useState } from 'react'
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import LightRays from './LightRays';

export default function UploadZone({ onImageSelect }) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file)
        }
    }, [onImageSelect])

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            onImageSelect(file)
        }
    }

    return (
        <CardContainer className="inter-var w-full max-w-2xl mx-auto cursor-target">
            <CardBody className="bg-black/40 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black/40 dark:border-white/[0.1] border-white/10 w-full h-auto rounded-3xl p-8 border backdrop-blur-xl transition-all duration-300 overflow-hidden">

                {/* LightRays Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <LightRays
                        raysOrigin="center"
                        raysColor="#a855f7"
                        raysSpeed={0.8}
                        lightSpread={0.3}
                        rayLength={1.5}
                        followMouse={true}
                        mouseInfluence={0.15}
                        noiseAmount={5}
                        distortion={2}
                        pulsating={false}
                        fadeDistance={0.5}
                        saturation={1.5}
                    />
                </div>

                {/* Title Item */}
                <CardItem
                    translateZ="50"
                    className="text-2xl font-bold text-center w-full mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent relative z-10"
                >
                    Analyze Your sample
                </CardItem>

                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-400 text-sm max-w-sm mt-2 text-center w-full mx-auto relative z-10"
                >
                    Upload an image to detect microplastics
                </CardItem>

                {/* Upload Area Item - Floating */}
                <CardItem translateZ="100" className="w-full mt-8 relative z-10">
                    <label
                        className={`
              relative flex flex-col items-center justify-center
              h-64 rounded-2xl cursor-pointer
              border-2 border-dashed transition-all duration-300
              ${isDragging
                                ? 'border-accent-400 bg-accent-400/10'
                                : 'border-white/20 hover:border-primary-400 hover:bg-white/5'}
            `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover/card:scale-110 transition-transform duration-300">
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>

                        <p className="text-lg font-medium text-white mb-2">
                            Drop image here
                        </p>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-gray-400 text-xs">
                            JPG, PNG, WEBP
                        </span>
                    </label>
                </CardItem>

                <CardItem
                    translateZ="40"
                    className="w-full mt-8 flex justify-center text-xs text-gray-500 relative z-10"
                >
                    Hover to interact • Drag & drop supported
                </CardItem>

            </CardBody>
        </CardContainer>
    )
}

