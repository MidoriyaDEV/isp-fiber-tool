import { createContext, useEffect, useState } from "react";
import axiosInstance from "../utility/axios";

export const PolylinesContext = createContext({
  polylines: [],
  setPolylines: () => {},
  addPolyline: () => {},
  setFetch: () => {},
});

export const PolylinesContextProvider = (props) => {
  const [polylines, setPolylines] = useState([]);
  const [fetch, setFetch] = useState(null);

  // Buscar todas as conexões
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/getAllConnection");
        const { data: { data } } = response;
        setPolylines(data);
      } catch (err) {
        console.error("Erro ao buscar conexões:", err);
      }
    };
    fetchData();
  }, [fetch]);

  // Adicionar uma polilinha nova localmente
  const addPolyline = (newPolyline) => {
    setPolylines(prev => [...prev, newPolyline]);
  };

  return (
    <PolylinesContext.Provider value={{ polylines, setPolylines, addPolyline, setFetch }}>
      {props.children}
    </PolylinesContext.Provider>
  );
};
