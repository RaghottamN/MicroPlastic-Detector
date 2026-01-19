import { useState, useCallback, useEffect } from 'react'
import { client } from '@gradio/client'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import ResultsView from './components/ResultsView'
import Footer from './components/Footer'
import GridScan from './components/GridScan'
import TargetCursor from './components/TargetCursor'

const API_URL = 'https://raghottamn-microplastic-detector.hf.space'

function App() {
  const [image, setImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('API URL:', API_URL)
  }, [])

  const handleImageSelect = useCallback((file) => {
    const url = URL.createObjectURL(file)
    setImage(url)
    setImageFile(file)
    setResults(null)
    setError(null)
    detectMicroplastics(file)
  }, [])

  const detectMicroplastics = async (file) => {
    setLoading(true)
    setError(null)

    try {
      const app = await client(API_URL)
      const result = await app.predict("/predict", [file])

      // result.data[0] = annotated image, result.data[1] = JSON results
      setResults(result.data[1])
    } catch (err) {
      console.error('Detection failed:', err)
      setError(err.message || 'Detection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (image) URL.revokeObjectURL(image)
    setImage(null)
    setImageFile(null)
    setResults(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-black overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost={true}
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>

      <TargetCursor />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
          {!image ? (
            <UploadZone onImageSelect={handleImageSelect} />
          ) : (
            <ResultsView
              image={image}
              results={results}
              loading={loading}
              error={error}
              onReset={handleReset}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default App
