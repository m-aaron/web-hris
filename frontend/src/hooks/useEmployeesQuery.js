import { useEffect, useState, useCallback } from "react";
import { getEmployees } from "../services/employeeService";

export const useEmployeesQuery = (query) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployees(query);
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Optimistic remove helper
  const removeFromList = (ids) => {
    setData((prev) => prev.filter((emp) => !ids.includes(emp.id)));
  };

  return {
    data,
    pagination,
    loading,
    refetch: fetchEmployees,
    removeFromList,
  };
};