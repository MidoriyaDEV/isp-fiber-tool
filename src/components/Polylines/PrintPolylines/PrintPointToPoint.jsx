import { InfoWindow, Marker, Polyline } from "@react-google-maps/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import coreColor from "../../../utility/coreColor";
import tjIcon from "../../../assets/img/tj.png";
import useEditablePolyline from "../../../hooks/useEditablePolyline";
import usePolylines from "../../../hooks/usePolylines";
import axiosInstance from "../../../utility/axios";

const PrintPointToPoint = ({ connection }) => {
  const [coordinates, setCoordinates] = useState([]);
  const { setFetch } = usePolylines();
  const { setParent } = useEditablePolyline();
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [position, setPosition] = useState(null);

  const { _id, name, location, totalCore, totalConnected, type, childrens = [], markers = [], length } = connection;

  // Transformar coordenadas da conexão em lat/lng
  useEffect(() => {
    if (location?.coordinates?.length) {
      const coords = location.coordinates.map((item) => ({ lat: item[1], lng: item[0] }));
      setCoordinates(coords);
    }
  }, [location]);

  // Configuração da Polyline
  const options = {
    geodesic: true,
    strokeColor: "#142F43",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  };

  // Status dos núcleos
  const CoreStatus = coreColor.slice(0, totalCore).map((item) => {
    const targetColor = childrens.find((child) => child.color === item.colorName);
    return (
      <p key={item.colorName} className="mb-1">
        {item.colorName} : {targetColor ? `em uso (Porta: ${targetColor.portNo})` : "disponível"}
      </p>
    );
  });

  const onClickHandler = (event) => setParent(connection, event.latLng);

  const deleteHandler = () => {
    if (!_id) return toast.error("ID da conexão não encontrado.");
    toast.promise(axiosInstance.delete(`/ptp-connection?id=${_id}`), {
      loading: "Excluindo...",
      success: () => {
        setFetch(true);
        return "Conexão excluída com sucesso";
      },
      error: ({
        response: {
          data: { message },
        },
      }) => message || "Erro ao excluir a conexão",
    });
  };

  return (
    <>
      <Polyline
        path={coordinates}
        options={options}
        onClick={onClickHandler}
        onRightClick={({ latLng }) => {
          setPosition(latLng);
          setShowInfoWindow(true);
        }}
      />

      {Array.isArray(markers) &&
        markers.map((marker) => {
          const [lat, lng] = marker?.location?.coordinates || [];
          if (lat == null || lng == null) return null;

          const icon = {
            url: tjIcon,
            scaledSize: new window.google.maps.Size(30, 30),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 15),
          };

          return (
            <Marker
              key={marker._id}
              position={{ lat, lng }}
              icon={icon}
              onClick={onClickHandler}
              onRightClick={({ latLng }) => {
                setPosition(latLng);
                setShowInfoWindow(true);
              }}
            />
          );
        })}

      {showInfoWindow && position && (
        <InfoWindow position={position} onCloseClick={() => setShowInfoWindow(false)}>
          <div>
            <p className="mb-1 fw-bold">{name}</p>
            <hr className="my-1" />
            <p className="mb-1">
              <span className="fw-bold">Tipo de Conexão:</span> {type}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Núcleos Utilizados:</span> {totalConnected}/{totalCore}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Distância:</span> {length?.toFixed(2) || 0}m
            </p>
            <button className="badge mb-1 bg-danger border-0" onClick={deleteHandler}>
              Excluir
            </button>
            <p className="mb-1 fw-bold">Status dos Núcleos:</p>
            <hr className="my-1 w-50" />
            {CoreStatus}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default PrintPointToPoint;
