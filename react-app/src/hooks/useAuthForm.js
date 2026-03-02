import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setPassengerToken, setPassengerTrainNo } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";

export const useAuthForm = ({ mode = "login" } = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { apiBase } = useApi();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    trainNo: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [trains, setTrains] = useState([]);
  const [loadingTrains, setLoadingTrains] = useState(false);

  // Fetch available trains on mount
  const fetchTrains = async () => {
    try {
      setLoadingTrains(true);
      const res = await axios.get(`${apiBase}/api/trains`);
      if (res.data.success) {
        setTrains(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching trains:", error);
    } finally {
      setLoadingTrains(false);
    }
  };

  const updateField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!values.username || !values.password || (mode === "register" && !values.email) || !values.trainNo) {
      setMessage("Please fill in all fields including train number.");
      setIsError(true);
      return;
    }

    try {
      if (mode === "login") {
        const res = await axios.post(`${apiBase}/user/login`, {
          username: values.username,
          password: values.password,
          trainNo: values.trainNo,
        }, {
          withCredentials: true
        });

        if (res.status === 200) {
          dispatch(setPassengerToken("authenticated"));
          dispatch(setPassengerTrainNo(values.trainNo));
          setMessage("Login successful. Redirecting...");
          navigate("/userDashboard");
        } else {
          setIsError(true);
          setMessage(res.data?.message || "Invalid username or password.");
        }
      } else {
        const res = await axios.post(`${apiBase}/user/register`, {
          username: values.username,
          email: values.email,
          password: values.password,
        }, {
          withCredentials: true
        });
        setIsError(false);
        setMessage(res.data?.message || "Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      setIsError(true);
      if (error.response) {
        setMessage(error.response.data?.message || "Request failed.");
      } else {
        setMessage("Unable to connect to server. Please try again later.");
      }
    }
  };

  return { values, updateField, submit, message, isError, trains, loadingTrains, fetchTrains };
};

export default useAuthForm;
