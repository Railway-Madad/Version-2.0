import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearPassengerToken } from "../store/slices/authSlice";
import { resetForm, setField, setMessages, setUsername } from "../store/slices/complaintSlice";
import { useApi } from "../context/ApiContext";

export const useComplaintForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiBase } = useApi();
  const isAuthenticated = useSelector((state) => state.auth.isPassengerAuthenticated);
  const complaint = useSelector((state) => state.complaint);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Clear messages on component mount
    dispatch(setMessages({ successMessage: "", errorMessage: "" }));
    
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        dispatch(clearPassengerToken());
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(`${apiBase}/user/profile`, {
          credentials: 'include',
        });
        if (res.status === 401) {
          dispatch(clearPassengerToken());
          navigate("/login");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        dispatch(setUsername(data.user?.username || ""));
      } catch (err) {
        dispatch(clearPassengerToken());
        navigate("/login");
      }
    };
    fetchProfile();
  }, [apiBase, dispatch, navigate, isAuthenticated]);

  const setFieldValue = (key, value) => dispatch(setField({ key, value }));

  const submitComplaint = async (e) => {
    e.preventDefault();
    dispatch(setMessages({ successMessage: "", errorMessage: "" }));

    const formData = new FormData();
    formData.append("username", complaint.username);
    formData.append("pnr", complaint.pnr);
    formData.append("bogieNumber", complaint.bogieNumber);
    formData.append("seatNumber", complaint.seatNumber);
    formData.append("description", complaint.description);
    formData.append("issueDomain", complaint.issueDomain);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch(`${apiBase}/complaint/submit-complaint`, {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (response.status === 401) {
        dispatch(clearPassengerToken());
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      dispatch(
        setMessages({
          successMessage: "Complaint successfully submitted!",
          errorMessage: "",
        })
      );
      dispatch(resetForm());
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      dispatch(
        setMessages({
          successMessage: "",
          errorMessage: "Something went wrong. Please try again.",
        })
      );
    }
  };

  return {
    complaint,
    setFieldValue,
    submitComplaint,
    imageFile,
    setImageFile,
    fileInputRef,
  };
};

export default useComplaintForm;
