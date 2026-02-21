const GlobalStyles = () => (
  <style>{`
    body, html, #root {
      background-color: #09090b; /* zinc-950 */
      color: #e4e4e7; /* zinc-200 */
      margin: 0;
      padding: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      scroll-behavior: smooth;
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* Scrollbar Styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #09090b; 
    }
    ::-webkit-scrollbar-thumb {
      background: #27272a; 
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3f3f46; 
    }
  `}</style>
);

export default GlobalStyles;