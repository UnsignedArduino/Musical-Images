class MusicalImage {
    private image_queue: Image[] = [];
    private stop: boolean = false;

    constructor() {
        ;
    }

    /**
     * Set the images to play. Note this will stop the currently playing song.
     * The images should be a number divisible by 2 x 88 px long.
     * First column of pixels is the notes to play, so the pixel at the top is the highest note on a piano, and the pixel at the bottom is the lowest note on the piano.
     * The second column of pixels is a binary representation of the number of milliseconds to play all those notes for, with the top pixel being 1, second pixel worth 2, third worth 4, etc.
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
    play(debug: boolean) {
        this.stop = false;
        if (debug) {
            game.consoleOverlay.setVisible(true);
        }
        for (let image of this.image_queue) {
            for (let col = 0; col < image.width; col += 2) {
                let freq_to_play: number[] = [];
                let time_to_play: number = 0;
                for (let row = 0; row < 88; row ++) {
                    if (image.getPixel(col, row) != 0) {
                        let name: string = this._note_num_to_name(row);
                        let freq: number = Math.round(this._note_num_to_freq(row));
                        freq_to_play.push(freq);
                        if (debug) {
                            console.log("Note:" + col + "," + row + ">" + name + "(" + freq + "hz)");
                        }
                    }
                    if (image.getPixel(col + 1, row) != 0) {
                        let value: number = Math.pow(2, row);
                        time_to_play += value;
                        if (debug) {
                            console.log("Time:" + (col + 1) + ","  + row + ">+" + value);
                        }
                    }
                }
                for (let freq of freq_to_play) {
                    control.runInParallel(() => {
                        music.playTone(freq, time_to_play);
                    });
                }
                if (debug) {
                    console.log("Playing for " + time_to_play + "ms");
                    console.log("-------------------------");
                }
                pause(time_to_play);
                if (this.stop) {
                    return;
                }
            }
        }
    }

    /**
     * Get the note name from the note number (0 is A1, 87 C8)
     * @param num: The note number. 
     * @return: The note name.
     */
    // https://stackoverflow.com/a/54546263/10291933
    _note_num_to_name(num: number): string {
        let notes: string[] = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
        let octave: number = Math.ceil(num / 12);
        let name: string = notes[num % 12];
        return name + octave;
    }

    /**
     * Get the note frequency from the note num1
     * @param note: The note num. 
     * @return: The note frequency.
     */
    // https://pages.mtu.edu/~suits/NoteFreqCalcs.html
    _note_num_to_freq(note: number): number {
        return 440 * Math.pow(Math.pow(2, 1 / 12), note - 36);
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