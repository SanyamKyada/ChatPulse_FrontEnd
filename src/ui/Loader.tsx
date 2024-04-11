import React from "react";

const Loader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <>
      {isLoading && <div className="overlay"></div>}
      <div className={`loader ${isLoading ? "visible" : ""}`}></div>
    </>
  );
};

export default Loader;
