import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import useGlossaryStore from '../stores/glossaryStore';

const GlossaryTooltip = ({ term, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!term) return children;

  return (
    <span className="relative">
      <button
        className="text-blue-600 hover:text-blue-800 underline cursor-help font-medium"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </button>
      {isVisible && (
        <div className="absolute z-10 w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">{term.term}</h4>
            {term.termArabic && (
              <h5 className="font-medium text-gray-700" dir="rtl">{term.termArabic}</h5>
            )}
            <p className="text-sm text-gray-600">{term.definition}</p>
            {term.definitionArabic && (
              <p className="text-sm text-gray-600" dir="rtl">{term.definitionArabic}</p>
            )}
            {term.category && (
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {term.category}
              </span>
            )}
          </div>
        </div>
      )}
    </span>
  );
};

const FormattedContent = ({ content, className = "" }) => {
  const { findTermByName } = useGlossaryStore();
  
  if (!content) return null;

  // Process content to replace {term} with glossary links
  const processGlossaryLinks = (text) => {
    if (typeof text !== 'string') return text;
    
    // Find all {term} patterns
    return text.split(/(\{[^}]+\})/).map((part, index) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const termName = part.slice(1, -1);
        const term = findTermByName(termName);
        
        if (term) {
          return (
            <GlossaryTooltip key={`${termName}-${index}`} term={term}>
              {termName}
            </GlossaryTooltip>
          );
        } else {
          // If term not found, still highlight it but without tooltip
          return (
            <span key={`${termName}-${index}`} className="text-orange-600 font-medium">
              {termName}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className={`formatted-content ${className}`}>
      <ReactMarkdown
        components={{
          // Customize how elements are rendered
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">
              {typeof children === 'string' ? processGlossaryLinks(children) : children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">
              {typeof children === 'string' ? processGlossaryLinks(children) : children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">
              {typeof children === 'string' ? processGlossaryLinks(children) : children}
            </em>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),
          br: () => <br />,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
          li: ({ children }) => (
            <li className="mb-1">
              {typeof children === 'string' ? processGlossaryLinks(children) : children}
            </li>
          ),
          // Handle text nodes directly
          text: ({ children }) => (
            typeof children === 'string' ? processGlossaryLinks(children) : children
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedContent;