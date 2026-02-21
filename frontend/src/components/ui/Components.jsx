import React from 'react';

export const Loader = () => (
  <div className="flex flex-col justify-center items-center h-screen w-full bg-zinc-950 absolute inset-0 z-[9999]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mb-4"></div>
    <div className="text-red-500 font-mono animate-pulse">INITIALIZING SYSTEM...</div>
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700",
    danger: "bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800",
    outline: "border border-red-600 text-red-500 hover:bg-red-600/10",
    ghost: "text-zinc-400 hover:text-white hover:bg-zinc-900"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1 mb-4">
    {label && <label className="text-zinc-400 text-sm font-medium">{label}</label>}
    <input 
      className={`bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-800'} rounded p-3 text-zinc-100 focus:outline-none focus:border-red-600 transition-colors w-full text-white`}
      {...props}
    />
    {error && <span className="text-red-500 text-xs">{error}</span>}
  </div>
);

export const Card = ({ title, children, className = '' }) => (
  <div className={`bg-zinc-950 border border-zinc-800 rounded-lg p-6 shadow-xl ${className}`}>
    {title && <h3 className="text-xl font-bold text-red-500 mb-4 border-b border-zinc-800 pb-2">{title}</h3>}
    {children}
  </div>
);