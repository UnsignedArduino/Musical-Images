//% color="#ff00E0"
//% icon="f001"
namespace MusicalImages {
    export class MusicalImage {
        private image_queue: Image[][] = [];
        private stop: boolean = false;
        private playing: boolean = false;
        private paused: boolean = false;

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

        set_image_queue(images: Image[][]) {
            this.stop = true;
            this.image_queue = images;
        }

        /**
         * Get the images to play. Returns a pointer to the internal array.
         * @return: A pointer to an array of images that you can modify.
         */
        get_image_queue(): Image[][] {
            return this.image_queue
        }

        /**
         * Play the musical images.
         */
        play(debug: boolean) {
            this.stop = false;
            this.playing = true;
            this.paused = false;
            if (debug) {
                game.consoleOverlay.setVisible(true);
            }
            for (let chunk = 0; chunk < this.image_queue[0].length; chunk ++) {
                for (let col = 0; col < this.image_queue[0][0].width; col += 2) {
                    let freq_to_play: number[][] = [];
                    let time_to_play: number[] = [];
                    for (let i = 0; i < this.image_queue.length; i ++) {
                        freq_to_play.push([]);
                        time_to_play.push(0);
                    }
                    let freqs_playing: number[] = [];
                    for (let i = 0; i < this.image_queue.length; i ++) {
                        let image: Image = this.image_queue[i][chunk];
                        for (let row = 0; row < 88; row++) {
                            if (image.getPixel(col, row) != 0) {
                                let name: string = this._note_num_to_name(row);
                                let freq: number = Math.round(this._note_num_to_freq(row));
                                freq_to_play[i].push(freq);
                                // if (debug) {
                                //     console.log("[" + i + "]" + "Note:" + col + "," + row + ">" + name + "(" + freq + "hz)");
                                // }
                            }
                            if (image.getPixel(col + 1, row) != 0) {
                                let value: number = Math.pow(2, row);
                                time_to_play[i] += value;
                                // if (debug) {
                                //     console.log("[" + i + "]" + "Time:" + (col + 1) + "," + row + ">+" + value);
                                // }
                            }
                        }
                        for (let freqs of freq_to_play) {
                            for (let freq of freqs) {
                                if (freqs_playing.indexOf(freq) == -1) {
                                    if (debug) {
                                        console.log("[" + i + "]" + "playTone(" + freq + "," + time_to_play[i] + ")");
                                    }
                                    ((frequency: number, duration: number) => {
                                        control.runInParallel(() => {
                                            music.playTone(frequency, duration);
                                        });
                                    })(freq, time_to_play[i]);
                                    freqs_playing.push(freq);
                                }
                            }
                        }
                    }
                    if (debug) {
                        // console.log("[" + i + "]" + "Playing for " + time_to_play[i] + "ms");
                        console.log("-------------------------");
                    }
                    let smallest_time: number = undefined;
                    for (let time of time_to_play) {
                        if (smallest_time == undefined || time < smallest_time) {
                            smallest_time = time;
                        }
                    }
                    pause(smallest_time);
                    music.stopAllSounds();
                    while ((!this.stop) && this.paused) {
                        pause(0);
                    }
                    if (this.stop) {
                        this.playing = false;
                        return;
                    }
                }
            }
            this.playing = false;
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
         * Get the note frequency from the note num
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

        /**
         * Get whether we are playing or not. 
         */
        is_playing(): boolean {
            return this.playing;
        }

        /**
         * Pauses. Does nothing if not playing.
         */
        pause_playing() {
            this.paused = true;
        }

        /**
         * Resumes. Does nothing if not playing.
         */
        resume_playing() {
            this.paused = false;
        }

        /**
         * Get whether we are paused or not.
         */
        is_paused(): boolean {
            return this.paused;
        }
    }

    let _mi: MusicalImage = undefined;

    /**
     * Initialize MusicalImage.
     */
    //% block="musical image initialize"
    //$ weight=100
    export function init_musical_image() {
        if (_mi == undefined) {
            _mi = new MusicalImage();
        }
    }

    /**
     * Set the image queue of the MusicalImage.
     * Note this will stop any song if any is playing. 
     * @param images: An array of Image. 
     */
    //% block="musical image set image queue to $images"
    //% images.shadow="lists_create_with"
    //% weight = 90
    export function set_queue(images: Image[][]) {
        if (_mi == undefined) {
            init_musical_image();
        }
        _mi.set_image_queue(images);
    }

    /**
    * Get the image queue of the MusicalImage.
    * @return: A pointer to an array of Image. 
    */
    //% block="musical image get image queue"
    //% weight=80
    export function get_queue(): Image[][] {
        if (_mi == undefined) {
            init_musical_image();
        }
        return _mi.get_image_queue();
    }

    /**
     * Start playing the MusicalImage.
     */
    //% block="musical image play"
    //% weight=70
    export function play() {
        if (_mi == undefined) {
            init_musical_image();
        }
        _mi.play(false);
    }

    /**
     * Stop playing the MusicalImage. Does nothing if not playing. 
     */
    //% block="musical image stop"
    //% weight=60
    export function stop() {
        if (_mi == undefined) {
            init_musical_image();
        }
        _mi.stop_playing();
    }

    /**
     * Get whether we are playing the MusicalImage or not. 
     */
    //% block="musical image is playing"
    //% weight=50
    export function is_playing(): boolean {
        if (_mi == undefined) {
            init_musical_image();
        }
        return _mi.is_playing();
    }

    /**
     * Pause the playing the MusicalImage. Does nothing if not playing. 
     */
    //% block="musical image pause"
    //% weight=40
    export function pause_playing() {
        if (_mi == undefined) {
            init_musical_image();
        }
        _mi.pause_playing();
    }

    /**
     * Resume the playing the MusicalImage. Does nothing if not playing. 
     */
    //% block="musical image resume"
    //% weight=30
    export function resume_playing() {
        _mi.resume_playing();
    }

    /**
     * Get whether the MusicalImage is paused or not. 
     */
    //% block="musical image is paused"
    //% weight=20
    export function is_paused(): boolean {
        return _mi.is_paused();
    }
}