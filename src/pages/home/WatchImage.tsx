"use client"

interface WatchImageProps {
    width?: number;
    height?: number;
    imageSource: {
        url: string;
    };
    name: string;
}

const WatchImage: React.FC<WatchImageProps> = ({ imageSource, name, width, height }: WatchImageProps) => {

    return (
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0">

            <img width={width} height={height}
                src={imageSource.url}
                alt={name}
            />
        </div>
    )
}

export default WatchImage;
