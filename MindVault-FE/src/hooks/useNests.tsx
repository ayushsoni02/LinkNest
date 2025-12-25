import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../Config";

export interface Nest {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
}

export function useNests() {
  const [nests, setNests] = useState<Nest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNests = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/nests`, {
        headers: {
          'Authorization': localStorage.getItem('token') || ''
        }
      });
      setNests(response.data.nests);
    } catch (error) {
      console.error("Error fetching nests:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNest = async (data: { name: string; description?: string }) => {
    try {
      await axios.post(`${BACKEND_URL}/api/v1/nests`, data, {
        headers: {
          'Authorization': localStorage.getItem('token') || ''
        }
      });
      await fetchNests(); // Refresh the list
    } catch (error) {
      console.error("Error creating nest:", error);
      throw error;
    }
  };

  const deleteNest = async (nestId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/nests/${nestId}`, {
        headers: {
          'Authorization': localStorage.getItem('token') || ''
        }
      });
      await fetchNests(); // Refresh the list
    } catch (error) {
      console.error("Error deleting nest:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchNests();
    
    // Refresh nests every 30 seconds
    const interval = setInterval(() => {
      fetchNests();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { nests, loading, fetchNests, createNest, deleteNest };
}
