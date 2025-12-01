import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addStockItem,
  deleteStockItem,
  resetFilters,
  setFilters,
  updateStockItem,
} from "../store/slices/stockSlice";

const DEFAULT_STOCK_FORM = {
  name: "",
  category: "Maintenance",
  quantity: 1,
  status: "in-stock",
};

export const useStockManager = ({ onStatus } = {}) => {
  const dispatch = useDispatch();
  const { items, filters } = useSelector((state) => state.stock);
  const [stockForm, setStockForm] = useState(DEFAULT_STOCK_FORM);
  const [editingId, setEditingId] = useState(null);

  const filteredItems = useMemo(() => {
    const query = (filters.query || "").toLowerCase();
    const category = filters.category || "all";
    const status = filters.status || "all";

    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);
      const matchesCategory =
        category === "all" || item.category.toLowerCase() === category.toLowerCase();
      const matchesStatus =
        status === "all" || item.status.toLowerCase() === status.toLowerCase();
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [filters, items]);

  const reportStats = useMemo(() => {
    const totalItems = items.length;
    const totalQuantity = items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
    const lowStock = items.filter(
      (item) => item.status === "low" || Number(item.quantity) < 50
    ).length;
    const categories = new Set(items.map((item) => item.category)).size;
    return { totalItems, totalQuantity, lowStock, categories };
  }, [items]);

  const setStockFormValue = (key, value) => {
    setStockForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetFormState = () => {
    setEditingId(null);
    setStockForm(DEFAULT_STOCK_FORM);
  };

  const submitStockForm = () => {
    const payload = {
      ...stockForm,
      quantity: Number(stockForm.quantity) || 0,
    };

    if (editingId) {
      dispatch(updateStockItem({ id: editingId, changes: payload }));
      onStatus?.(`Stock item ${editingId} updated.`);
    } else {
      dispatch(addStockItem(payload));
      onStatus?.("Stock item added to the dashboard.");
    }
    resetFormState();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setStockForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      status: item.status,
    });
  };

  const removeItem = (id) => {
    dispatch(deleteStockItem(id));
    onStatus?.(`Removed ${id} from stock records.`);
  };

  const updateFilter = (key, value) => {
    dispatch(
      setFilters({
        ...filters,
        [key]: value,
      })
    );
  };

  const clearFilters = () => dispatch(resetFilters());

  return {
    stockForm,
    setStockFormValue,
    editingId,
    startEdit,
    resetFormState,
    submitStockForm,
    removeItem,
    filters,
    updateFilter,
    clearFilters,
    filteredItems,
    reportStats,
  };
};

export default useStockManager;
