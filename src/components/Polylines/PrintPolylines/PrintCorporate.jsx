import { InfoWindow, Marker, Polyline } from "@react-google-maps/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import coreColor from "../../../utility/coreColor";
import usePolylines from "../../../hooks/usePolylines";

const PrintPTP = ({ connection }) => {
  const [coordinates, setCoordinates] = useState([]);
  const { setFetch } = usePolylines();
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [position, setPosition] = useState(null);

  const { name, location, type, totalCore, length, color, _id } = connection;

  // Converte as coordenadas do backend ([lng, lat]) para {lat, lng}
  useEffect(() => {
    if (location?.coordinates && location.coordinates.length > 0) {
      const coords = location.coordinates.map(([lng, lat]) => ({ lat, lng }));
      setCoordinates(coords);
    }
  }, [location?.coordinates]);

  const options = {
    geodesic: true,
    strokeColor: coreColor.find(item => item.colorName === color)?.colorCode || "#000000",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  };

  const deleteHandler = () => {
    toast.promise(
      axiosInstance.delete(`/ptp-connection?id=${_id}`),
      {
        loading: "Excluindo conexão PTP...",
        success: () => {
          setFetch(true);
          return "Conexão PTP excluída com sucesso";
        },
        error: ({ response }) => response?.data?.message || "Erro ao excluir conexão",
      }
    );
  };

  if (coordinates.length === 0) return null;

  return (
    <>
      <Polyline
        path={coordinates}
        options={options}
        onRightClick={({ latLng }) => {
          setPosition(latLng);
          setShowInfoWindow(true);
        }}
      />

      {/* Marker no último ponto */}
      <Marker
        position={coordinates[coordinates.length - 1]}
        onRightClick={({ latLng }) => {
          setPosition(latLng);
          setShowInfoWindow(true);
        }}
      />

      {showInfoWindow && position && (
        <InfoWindow position={position} onCloseClick={() => setShowInfoWindow(false)}>
          <div>
            <p className="mb-1 fw-bold">{name}</p>
            <hr className="my-1" />
            <p className="mb-1"><span className="fw-bold">Tipo de Conexão:</span> {type}</p>
            <p className="mb-1"><span className="fw-bold">Distância:</span> {length?.toFixed(2)}m</p>
            <p className="mb-1"><span className="fw-bold">Total de Núcleos:</span> {totalCore}</p>
            <p className="mb-1"><span className="fw-bold">Cor do Núcleo:</span> {color}</p>
            <button className="badge mb-1 bg-danger border-0" onClick={deleteHandler}>
              Excluir
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default PrintPTP;
