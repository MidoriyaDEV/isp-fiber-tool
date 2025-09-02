import React, { useState } from "react";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import toast from "react-hot-toast";
import useEditablePolyline from "../../../hooks/useEditablePolyline";
import usePolylines from "../../../hooks/usePolylines";
import axiosInstance from "../../../utility/axios";
import allCoreColor from "../../../utility/coreColor";
import CoreSelect from "../../Shared/Form/CoreSelect";

const CompanyForm = ({ handleClose }) => {
  const { coordinates, reset, parent } = useEditablePolyline();
  const { setNewAddedPolyline } = usePolylines();

  const [formData, setFormData] = useState({
    name: "",
    portNo: "",
    coreColor: "",
    coreCount: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getUnusedColors = () => {
    if (!parent) return [];
    const total = parent.totalCore || 0;
    const children = parent.childrens || [];
    return allCoreColor
      .slice(0, total)
      .filter((c) => !children.some((ch) => ch.color === c.colorName))
      .map((c) => (
        <option key={c.colorName} value={c.colorName}>
          {c.colorName}
        </option>
      ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // prevent double submit
    if (isSubmitting) return;

    const { name, coreColor, portNo, coreCount } = formData;

    if (!window.google?.maps?.geometry?.spherical) {
      toast.error("Google Maps não carregou ainda. Tente novamente em alguns segundos.");
      return;
    }

    const length = window.google.maps.geometry.spherical.computeLength(coordinates || []);

    const newCompanyConnection = {
      parent: parent?._id,
      name,
      portNo,
      coreColor,
      coordinates,
      totalCore: parseInt(coreCount || "0", 10),
      length,
    };

    setIsSubmitting(true);

    const promise = axiosInstance.post("/corporate-connection", newCompanyConnection);

    toast.promise(promise, {
      loading: "Adding new company connection...",
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

    try {
      await promise;
    } catch (err) {
      // já tratado no toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };

  // If parent isn't ready yet, don't render problematic selects
  const unusedColorOptions = getUnusedColors();

  return (
    <Form onSubmit={handleSubmit}>
      <Modal.Body>
        <Form.Group className="mb-2">
          <Form.Label className="visually-hidden">Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label className="visually-hidden">Port No</Form.Label>
          <Form.Control
            type="text"
            placeholder="Port No"
            name="portNo"
            value={formData.portNo}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label className="visually-hidden">Core Color</Form.Label>
          <Form.Select
            name="coreColor"
            value={formData.coreColor}
            onChange={handleChange}
            aria-label="Select Core Color"
          >
            <option value="">Select Core Color...</option>
            {unusedColorOptions}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mt-2">
          <CoreSelect name="coreCount" value={formData.coreCount} onChange={handleChange} />
        </Form.Group>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose} disabled={isSubmitting}>
          Close
        </Button>

        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner animation="border" size="sm" role="status" aria-hidden="true" />{" "}
              <span style={{ marginLeft: 8 }}>Submitting...</span>
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </Modal.Footer>
    </Form>
  );
};

export default CompanyForm;
