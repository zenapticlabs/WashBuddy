import { createContext, useContext, Dispatch, SetStateAction, ReactNode } from 'react';
import { IWashType } from '@/types';

interface WashTypesContextType {
  washTypes: IWashType[];
  setWashTypes: Dispatch<SetStateAction<IWashType[]>>;
}

const WashTypesContext = createContext<WashTypesContextType | undefined>(undefined);

interface WashTypesProviderProps {
  children: ReactNode;
  value: WashTypesContextType;
}

export function WashTypesProvider({ children, value }: WashTypesProviderProps) {
  return (
    <WashTypesContext.Provider value={value}>
      {children}
    </WashTypesContext.Provider>
  );
}

export function useWashTypes() {
  const context = useContext(WashTypesContext);
  if (context === undefined) {
    throw new Error('useWashTypes must be used within a WashTypesProvider');
  }
  return context;
} 