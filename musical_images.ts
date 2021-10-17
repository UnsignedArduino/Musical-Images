class MusicalImage {
    private image_queue: Image[] = [];
    private stop: boolean = false;

    constructor() {
        ;
    }

    /**
     * Set the images to play. Note this will stop the currently playing song.
     * @param images: An array of images to play. 
     */
    set_image_queue(images: Image[]) {
        this.stop = true;
        this.image_queue = images;
    }

    /**
     * Get the images to play. Returns a pointer to the internal array.
     * @return: A pointer to an array of images that you can modify.
     */
    get_image_queue(): Image[] {
        return this.image_queue
    }

    /**
     * Play the musical images.
     */
    play() {
        this.stop = false;
    }

    /**
     * Stop playing. Does nothing if not playing.
     */
    stop_playing() {
        this.stop = true;
    }
}

namespace MusicalImages {

}