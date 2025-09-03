import { InfoWindow, Marker, Polyline } from "@react-google-maps/api";
import React, { useEffect, useState } from "react";
import coreColor from "../../../utility/coreColor";

import resellerIcon from "../../../assets/img/olt.png";
import useEditablePolyline from "../../../hooks/useEditablePolyline";
import toast from "react-hot-toast";
import axiosInstance from "../../../utility/axios";
import usePolylines from "../../../hooks/usePolylines";

const PrintReseller = ({ connection }) => {
  const { setParent } = useEditablePolyline();
  const { setFetch } = usePolylines();
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [position, setPosition] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

  const {
    _id,
    name,
    type,
    portNo,
    oltType,
    oltSerialNumber,
    color,
    connectionLimit,
    location,
    childrens = [],
    connectionUsed,
    totalCore,
    length,
  } = connection;

  useEffect(() => {
    if (location?.coordinates?.length) {
      const coords = location.coordinates.map((item) => ({ lat: item[0], lng: item[1] }));
      setCoordinates(coords);
    }
  }, [location?.coordinates]);

  const options = {
    geodesic: true,
    strokeColor: coreColor.find((item) => item.colorName === color)?.colorCode || "#000",
    strokeOpacity: 1.0,
    strokeWeight: 4,
  };

  const childConnection = childrens.map((child, index) => {
    if (child.connectionType === "splitter") {
      return (
        <p className="mb-1" key={index}>
          Port: {child.portNo}: {child.connectionUsed}/{connectionLimit}
        </p>
      );
    }
    return null;
  });

  const icon = {
    url: resellerIcon,
    scaledSize: new window.google.maps.Size(35, 50),
    origin: new window.google.maps.Point(0, 0),
    anchor: new window.google.maps.Point(15, 15),
  };

  const onClickHandler = (event) => setParent(connection, event.latLng);

  const deleteHandler = () => {
    if (!_id) return toast.error("ID da conexão não encontrado.");
    toast.promise(axiosInstance.delete(`/reseller-connection?id=${_id}`), {
      loading: "Deleting...",
      success: () => {
        setFetch(true);
        return "Deleted successfully";
      },
      error: ({ response: { data: { message } = {} } = {} }) => message || "Erro ao excluir a conexão",
    });
  };

  const lastCoordinate = coordinates[coordinates.length - 1];

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
          onClick={onClickHandler}
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
            <p className="mb-1">
              <span className="fw-bold">Connection Type:</span> {type}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Core Color:</span> {color}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Port No:</span> {portNo}
            </p>
            <p className="mb-1">
              <span className=" fw-bold">Distance:</span> {length?.toFixed(2) || 0}m
            </p>
            <p className="mb-1">
              <span className="fw-bold">Olt Type:</span> {oltType}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Total Connection Used:</span> {connectionUsed || 0}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Olt Serial Number:</span> {oltSerialNumber}
            </p>
            <p className="mb-1">
              <span className="fw-bold">Total Core:</span> {totalCore || 0}
            </p>
            <button className="badge mb-1 bg-danger border-0" onClick={deleteHandler}>
              Delete
            </button>
            <p className="mb-1 fw-bold">Port Used: </p>
            <hr className="my-1 w-50" />
            {childConnection}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default PrintReseller;
