import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import useEditablePolyline from "../../../hooks/useEditablePolyline";
import usePolylines from "../../../hooks/usePolylines";
import axiosInstance from "../../../utility/axios";
import allCoreColor from "../../../utility/coreColor";
import CoreSelect from "../../Shared/Form/CoreSelect";

const ResellerForm = ({ handleClose }) => {
  const { coordinates, reset, parent } = useEditablePolyline();
  const { setNewAddedPolyline } = usePolylines();

  const [formData, setFormData] = useState({
    name: "",
    oltSerialNumber: "",
    portNo: "",
    oltType: "",
    color: "",
    coreCount: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getUnusedColors = () => {
    if (!parent) return [];
    return allCoreColor
      .slice(0, parent.totalCore)
      .filter(c => !parent.childrens.some(child => child.color === c.colorName))
      .map(c => (
        <option key={c.colorName} value={c.colorName}>
          {c.colorName}
        </option>
      ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, oltSerialNumber, portNo, oltType, color, coreCount } = formData;

    if (!window.google?.maps?.geometry?.spherical) {
      toast.error("Google Maps is not loaded yet.");
      return;
    }

    const length = window.google.maps.geometry.spherical.computeLength(coordinates);

    const newPolyline = {
      parent: parent._id,
      type: "reseller",
      name,
      oltSerialNumber,
      portNo,
      oltType,
      coordinates,
      color,
      totalCore: parseInt(coreCount, 10),
      length,
    };

    toast.promise(axiosInstance.post("/reseller-connection", newPolyline), {
      loading: "Adding new reseller connection...",
      success: ({ data: { data } }) => {
        setNewAddedPolyline(true);
        reset();
        handleClose();
        return `Successfully added new ${data.type} Connection`;
      },
      error: (err) => {
        const res = err.response?.data;
        if (res?.errors) return res.errors[0].msg;
        if (res?.message) return res.message;
        return "Something went wrong!";
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Control
            type="text"
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Control
            type="text"
            placeholder="Olt Serial Number"
            name="oltSerialNumber"
            value={formData.oltSerialNumber}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Control
            type="text"
            placeholder="Port No"
            name="portNo"
            value={formData.portNo}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Check
            type="radio"
            label="EPON"
            value="epon"
            name="oltType"
            checked={formData.oltType === "epon"}
            onChange={handleChange}
          />
          <Form.Check
            type="radio"
            label="GPON"
            value="gpon"
            name="oltType"
            checked={formData.oltType === "gpon"}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-1">
          <Form.Select
            name="color"
            value={formData.color}
            onChange={handleChange}
          >
            <option value="">Select Core Color...</option>
            {getUnusedColors()}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mt-2">
          <CoreSelect
            name="coreCount"
            value={formData.coreCount}
            onChange={handleChange}
          />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Modal.Footer>
    </Form>
  );
};

export default ResellerForm;
