import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";

import useEditablePolyline from "../../../hooks/useEditablePolyline";
import usePolylines from "../../../hooks/usePolylines";
import axiosInstance from "../../../utility/axios";
import coreColor from "../../../utility/coreColor";

import CoreSelect from "../../Shared/Form/CoreSelect";

const SplitterForm = ({ handleClose }) => {
  const { coordinates, reset, parent } = useEditablePolyline();
  const { setNewAddedPolyline } = usePolylines();

  const [formData, setFormData] = useState({
    name: "",
    OltPortNo: "",
    color: "",
    splitterType: "",
    coreCount: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getUnusedColor = () => {
    if (!parent) return [];

    let children = parent.childrens;
    let totalCores = parent.totalCore || parent.splitterLimit;

    if (parent.type === "localFiber" && parent.mainLocalFiber) {
      children = parent.mainLocalFiber.childrens;
    }

    return coreColor
      .slice(0, totalCores)
      .filter(c => !children.some(child => child.color === c.colorName))
      .map(c => (
        <option key={c.colorName} value={c.colorName}>
          {c.colorName}
        </option>
      ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, OltPortNo, color, splitterType, coreCount } = formData;

    if (!window.google?.maps?.geometry?.spherical) {
      toast.error("Google Maps is not loaded yet.");
      return;
    }

    const length = window.google.maps.geometry.spherical.computeLength(coordinates);

    const newPolyline = {
      parentType: parent.type,
      parent: parent._id,
      name,
      coordinates,
      splitterLimit: splitterType,
      color,
      portNo: OltPortNo,
      totalCore: parseInt(coreCount, 10),
      length,
    };

    toast.promise(axiosInstance.post("/splitter-connection", newPolyline), {
      loading: "Adding new splitter connection...",
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

        {parent?.type !== "splitter" && (
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="Olt Port No"
              name="OltPortNo"
              value={formData.OltPortNo}
              onChange={handleChange}
            />
          </Form.Group>
        )}

        {(parent?.type === "localFiber" || parent?.type === "splitter") && (
          <Form.Group className="mb-2">
            <Form.Select
              name="color"
              value={formData.color}
              onChange={handleChange}
            >
              <option value="">Select Fiber Core</option>
              {getUnusedColor()}
            </Form.Select>
          </Form.Group>
        )}

        <Form.Group className="mb-2">
          <Form.Select
            name="splitterType"
            value={formData.splitterType}
            onChange={handleChange}
          >
            <option value="">Select Splitter Type</option>
            <option value="2">1/2</option>
            <option value="4">1/4</option>
            <option value="8">1/8</option>
            <option value="16">1/16</option>
            <option value="32">1/32</option>
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

export default SplitterForm;
