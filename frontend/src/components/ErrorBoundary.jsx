import React from 'react'; 
export default class ErrorBoundary extends React.Component { 
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null, errorInfo: null }; 
  } 
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  } 
  componentDidCatch(error, errorInfo) { 
    this.setState({ errorInfo }); 
    console.error('ErrorBoundary caught:', error, errorInfo); 
  } 
  render() { 
    if (this.state.hasError) { 
      return ( 
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', minHeight: '100vh' }}> 
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Dashboard Crashed: Something went wrong.</h2> 
          <p style={{ marginTop: '10px', marginBottom: '20px' }}>Please copy this error and share it with the developer so they can fix it.</p>
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
            <h3 style={{ fontWeight: 'bold' }}>Error Message:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', marginBottom: '15px' }}> 
              {this.state.error && this.state.error.toString()} 
            </pre>
            <h3 style={{ fontWeight: 'bold' }}>Component Stack:</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px', color: '#555' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
        </div> 
      ); 
    } 
    return this.props.children; 
  } 
}
