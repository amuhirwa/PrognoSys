import axios, { AxiosError } from "axios";
import { useSelector, useDispatch } from "react-redux";
import { store } from "../app/store";
import toast from "react-hot-toast";
import { resetStateToDefault } from "./SharedData";

function createAxiosInstance() {
  const info = localStorage.getItem("persist:prognosys");
  let token = "";
  if (info) {
    const userInfo = JSON.parse(JSON.parse(info).usersLogin);
    token = userInfo.token;
  }
  else {
    token = sessionStorage.getItem("token");
  }
  const instance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorObj = error;
      if (
        errorObj.response?.status == 401
        && errorObj.response?.config.url != "notifications/"
      ) {
        store.dispatch(resetStateToDefault());

        localStorage.removeItem("persist:prognosys");
        sessionStorage.removeItem("token");
        
        toast.error("Session expired. Please login again.");
        
        window.location.href = "/login";
        
        return Promise.reject(error);
      } else {
        const errorData = errorObj.response?.data;
        let errorMessage = errorData
          ? errorData.error || errorObj.message
          : "Unexpected error. Please try again later.";
        if (
          errorMessage !== undefined &&
          errorMessage.indexOf("Request failed with status code") < 0
        ) {
          toast.error(errorMessage);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const api = () => createAxiosInstance();

export default createAxiosInstance;
