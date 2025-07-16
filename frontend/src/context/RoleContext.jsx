import React, { createContext, useState } from 'react';

// 1️⃣ Create the context
const RoleContext = createContext();

// 2️⃣ Provide context to the entire app
const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleProvider;
export { RoleContext };