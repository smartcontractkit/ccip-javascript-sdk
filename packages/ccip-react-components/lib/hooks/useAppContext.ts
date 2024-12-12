import { Context } from '@/AppContext';
import { useContext } from 'react';

export const useAppContext = () => useContext(Context);
