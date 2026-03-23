import { useState, useEffect, useCallback, useRef } from 'react';
import { useAxios } from '../../app/contexts/AxiosContext';
import { useUserContext } from '../contexts/UserContext';

const usePaymentMethod = () => {
  const axios = useAxios();
  const { user } = useUserContext();
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  const hasPaymentMethod = !!(paymentMethod?.payment_type);

  const loadPaymentMethod = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosRef.current.get('/api/user/payment-method');
      setPaymentMethod(response.data.data || response.data);
    } catch (err) {
      console.error('Error loading payment method:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePaymentMethod = useCallback(async (data) => {
    try {
      const response = await axiosRef.current.put('/api/user/payment-method', data);
      setPaymentMethod(response.data.data || response.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update payment method',
      };
    }
  }, []);

  const clearPaymentMethod = useCallback(async () => {
    // Set local state to empty (backend doesn't have a delete endpoint,
    // so we update with empty values)
    setPaymentMethod({
      payment_type: null,
      payment_account_name: null,
      payment_account_number: null,
      payment_bank_name: null,
    });
  }, []);

  // Load once when user is authenticated
  useEffect(() => {
    if (!loadedRef.current && user) {
      loadedRef.current = true;
      loadPaymentMethod();
    }
  }, [loadPaymentMethod, user]);

  return {
    paymentMethod,
    loading,
    hasPaymentMethod,
    updatePaymentMethod,
    loadPaymentMethod,
    clearPaymentMethod,
  };
};

export default usePaymentMethod;
