import React, { useEffect, useState } from "react";
import { InfoWindow, Marker, Polyline } from "@react-google-maps/api";
import coreColor from "../../../utility/coreColor";
import homeIcon from "../../../assets/img/onu.png";
import toast from "react-hot-toast";
import axiosInstance from "../../../utility/axios";
import usePolylines from "../../../hooks/usePolylines";

const PrintHome = ({ connection }) => {
  const { setFetch } = usePolylines();
  const [coordinates, setCoordinates] = useState([]);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [position, setPosition] = useState(null);

  const { name, color, onuNo, type, locations, _id, totalCore, length } = connection;

  // Transformar coordenadas para lat/lng corretos
  useEffect(() => {
    if (locations?.coordinates?.length) {
      const coords = locations.coordinates.map(([lng, lat]) => ({ lat, lng }));
      setCoordinates(coords);
    }
  }, [locations]);

  const options = {
    geodesic: true,
    strokeColor: coreColor.find((item) => item.colorName === color)?.colorCode || "#000",
    strokeOpacity: 1.0,
    strokeWeight: 3,
  };

  const icon = {
    url: homeIcon,
    scaledSize: new window.google.maps.Size(35, 25),
    origin: new window.google.maps.Point(0, 0),
    anchor: new window.google.maps.Point(15, 15),
  };

  const lastCoordinate = coordinates[coordinates.length - 1] || null;

  const deleteHandler = () => {
    if (!_id) return toast.error("ID da conexão não encontrado.");
    toast.promise(axiosInstance.delete(`/home-connection?id=${_id}`), {
      loading: "Excluindo...",
      success: () => {
        setFetch(true);
        return "Conexão residencial excluída com sucesso";
      },
      error: ({
        response: {
          data: { message },
        },
      }) => message || "Erro ao excluir a conexão",
    });
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

      {lastCoordinate && (
        <Marker
          position={lastCoordinate}
          icon={icon}
          onRightClick={({ latLng }) => {
            setPosition(latLng);
            setShowInfoWindow(true);
          }}
        />
      )}

      {showInfoWindow && position && (
        <InfoWindow position={position} onCloseClick={() => setShowInfoWindow(false)}>
          <div>
            <p className="mb-1 fw-bold">{name}</p>
            <hr className="my-1" />
            <p className="mb-1"><span className="fw-bold">Número da ONU:</span> {onuNo}</p>
            <p className="mb-1"><span className="fw-bold">Tipo de Conexão:</span> {type}</p>
            <p className="mb-1"><span className="fw-bold">Cor do Núcleo:</span> {color}</p>
            <p className="mb-1"><span className="fw-bold">Distância:</span> {length?.toFixed(2) || 0}m</p>
            <p className="mb-1"><span className="fw-bold">Total de Núcleos:</span> {totalCore}</p>
            <button className="badge mb-1 bg-danger border-0" onClick={deleteHandler}>
              Excluir
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default PrintHome;
