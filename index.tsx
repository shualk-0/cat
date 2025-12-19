
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Could not find root element to mount the app.");
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>应用启动失败</h1>
      <p>找不到根元素 #root</p>
    </div>
  `;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Mounting Error:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h1>应用启动失败</h1>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 8px; cursor: pointer;">
          刷新页面
        </button>
      </div>
    `;
  }
}
