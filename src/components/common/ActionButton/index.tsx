import tw from '@utils/tw';
import { TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
interface ActionButtonProps {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
  color: string;
  style?: any;
  textstyle?: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  text,
  onPress,
  color,
  style,
  textstyle,
}) => (
  <TouchableOpacity
    style={[
      tw`flex-1 flex-row items-center justify-center py-2.5 rounded-lg`,
      { backgroundColor: `${color}20` },
      style,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon}
    <Text style={[tw`ml-1.5 text-sm font-medium`, { color }]}>{text}</Text>
  </TouchableOpacity>
);

export default ActionButton;
