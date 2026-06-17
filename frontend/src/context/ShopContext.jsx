import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthContext';
const ShopContext = createContext(undefined);

export function ShopProvider({ children }) {
    const [shops, setShops] = useState([]);
    const [activeShop, setActiveShopState] = useState(null);
    const [activeShopId, setActiveShopId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, loading: authLoading } = useContext(AuthContext);
    const fetchShops = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/shopify/shops');
            console.log('[ShopContext] raw response.data:', JSON.stringify(response.data));

            const loadedShops = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.shops)
                    ? response.data.shops
                    : Array.isArray(response.data?.data)
                        ? response.data.data
                        : [];

            setShops(loadedShops);
            if (loadedShops.length === 0) {
                setActiveShopState(null);
                setActiveShopId(null);
                localStorage.removeItem('activeShopId');
            } else {
                const storedId = localStorage.getItem('activeShopId');
                const validShop = loadedShops.find(s => String(s.id) === String(storedId));

                if (validShop) {
                    setActiveShopState(validShop);
                    setActiveShopId(validShop.id);
                } else {
                    const firstShop = loadedShops[0];
                    setActiveShopState(firstShop);
                    console.log(
                        '[ShopContext] setting active shop:',
                        firstShop
                    );
                    setActiveShopId(firstShop.id);
                    localStorage.setItem('activeShopId', firstShop.id);
                }
            }
        } catch (err) {
            console.error(
    '[ShopContext] ERROR',
    err
  );
            setError('Failed to load Shopify stores.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;   
        if (!user) return;        
        fetchShops();
    }, [authLoading, user, fetchShops]);

    const setActiveShop = (shopOrId) => {
        if (!shopOrId) {
            setActiveShopState(null);
            setActiveShopId(null);
            localStorage.removeItem('activeShopId');
            return;
        }

        let targetShop = null;
        if (typeof shopOrId === 'object' && shopOrId.id) {
            targetShop = shopOrId;
        } else {
            targetShop = shops.find(s => String(s.id) === String(shopOrId));
        }

        if (targetShop) {
            setActiveShopState(targetShop);
            setActiveShopId(targetShop.id);
            localStorage.setItem('activeShopId', targetShop.id);
        }
    };
    console.log('[ShopContext]', {
        activeShopId,
        loading,
        shops,
    });
    return (
        <ShopContext.Provider
            value={{
                activeShop,
                activeShopId,
                shops,
                loading,
                error,
                setActiveShop,
                refreshShops: fetchShops
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
}