import { useEffect, useState, useCallback } from "react";
import { getFaculties } from "../services/facultyService";

export const useFacultiesQuery = (query) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFaculties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFaculties(query);
      setData(res.data.faculties || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  const removeFromList = (ids) => {
    setData((prev) => prev.filter((f) => !ids.includes(f.id)));
  };

  return {
    data,
    loading,
    refetch: fetchFaculties,
    removeFromList,
  };
};
