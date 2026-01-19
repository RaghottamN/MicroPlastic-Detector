export default function Footer() {
    return (
        <footer className="glass border-t border-white/10 py-6">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-gray-400 text-sm">
                    Powered by <span className="text-primary-300 font-medium">Faster R-CNN</span> with ResNet-50 FPN Backbone
                </p>
                <p className="text-gray-600 text-xs mt-1">
                    Model trained on microplastic detection dataset • Epoch 48
                </p>
            </div>
        </footer>
    )
}
