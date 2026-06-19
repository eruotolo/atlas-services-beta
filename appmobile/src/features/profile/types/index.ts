export interface FavoriteService {
  readonly id: string;
  readonly name: string;
  readonly rating: number;
  readonly imageUrl: string;
}

export interface ProfileMenuItem {
  readonly id: string;
  readonly label: string;
  readonly subtitle?: string;
  readonly iconName: string;
  readonly iconBg: string;
  readonly iconColor: string;
  readonly onPress: () => void;
}
