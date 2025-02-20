import React, { useState, createContext } from 'react';

export const LoadedPageContext = createContext();

export const LoadedPageProvider = ({ children }) => {
  const [isLoadedPage, setIsLoadedPage] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPrintPage, setIsPrintPage] = useState(false);

  return (
    <LoadedPageContext.Provider value={
      {
        isLoadedPage,
        setIsLoadedPage,
        loadingMessage,
        setLoadingMessage,
        isPrintPage,
        setIsPrintPage,
      }
    }
    >
      {children}
    </LoadedPageContext.Provider>
  );
};
