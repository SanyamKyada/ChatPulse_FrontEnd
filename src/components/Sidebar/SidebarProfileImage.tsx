import React, { FC, useRef, useState } from "react";
import { UserApi } from "../../axios";
import { getUserId, updateProfileImage } from "../../util/auth";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../types/redux";
import { userActions } from "../../store/slices/user-slice";
import { sendContactProfileImageChanged } from "../../services/signalR/SignalRService";
const baseImageUrl = import.meta.env.VITE_IMAGES_URL;

const SidebarProfileImage: FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userProfileImage = useSelector(
    (state: RootState) => state.user.profileImage
  );
  const [imageUrl, setImageUrl] = useState<string | null>(userProfileImage);

  const dispatch = useDispatch();

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setIsLoading(true);
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      const userId = getUserId();
      const response = await UserApi.UploadProfileImage(userId, formData);
      if (response.statusCode === 200) {
        setImageUrl(response.filePath);
        updateProfileImage(response.filePath);
        dispatch(userActions.updateProfileImage(response.filePath));
        await sendContactProfileImageChanged(response.filePath);
      }
      setIsLoading(false);
    }
  };
  console.log(userProfileImage, imageUrl);
  return (
    <button
      onClick={handleButtonClick}
      style={{
        backgroundImage: imageUrl
          ? `url(${baseImageUrl}/${imageUrl})`
          : "#c8b5db",
      }}
    >
      {!imageUrl && (
        <div>
          <i className="ri-camera-line"></i>
        </div>
      )}
      {imageUrl && (
        <div className="icon-edit">
          <i className="ri-pencil-line"></i>
        </div>
      )}
      {isLoading && (
        <span className="water-loader" style={{ display: "block" }}></span>
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </button>
  );
};

export default SidebarProfileImage;
