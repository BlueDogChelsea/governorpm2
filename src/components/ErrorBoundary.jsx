import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo)
        this.setState({ errorInfo })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl m-4">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                        <h2 className="text-xl font-bold text-red-800">Something went wrong</h2>
                    </div>
                    <details className="whitespace-pre-wrap text-sm text-red-700 bg-red-100 p-4 rounded overflow-auto max-h-96">
                        <summary className="font-semibold mb-2 cursor-pointer">Error Details</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
