import Image from "next/image";
import user from "@/assets/user.png";

interface UserComponentProps {}

const UserComponent: React.FC<UserComponentProps> = ({}) => {
  return (
    <Image
      src={user}
      alt="user"
      width={32}
      height={32}
      className="rounded-full"
    />
  );
};

export default UserComponent;
