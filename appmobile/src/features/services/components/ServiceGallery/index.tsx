import { useState } from 'react';
import { Dimensions, FlatList, Image, View } from 'react-native';

import { Colors } from '@/shared/constants/colors';

const { width } = Dimensions.get('window');

interface Props {
    readonly images: readonly string[];
}

export function ServiceGallery({ images }: Props): React.JSX.Element {
    const [activeIndex, setActiveIndex] = useState(0);

    if (images.length === 0) {
        return <View style={{ height: 300, width, backgroundColor: Colors.surfaceContainerHigh }} />;
    }

    return (
        <View style={{ height: 300, width }}>
            <FlatList
                data={images}
                keyExtractor={(item, idx) => `${item}-${idx}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                }}
                renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={{ height: 300, width }} resizeMode="cover" />
                )}
            />
            {images.length > 1 && (
                <View className="absolute bottom-10 flex-row w-full justify-center gap-1.5">
                    {images.map((_, i) => (
                        <View
                            key={i}
                            className={`h-1.5 rounded-full ${i === activeIndex ? 'w-3 bg-surfaceContainerLowest' : 'w-1.5 bg-[rgba(255,255,255,0.4)]'}`}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}
