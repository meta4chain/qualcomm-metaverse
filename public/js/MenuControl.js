
export default class MenuControl {
    constructor() {
        this.muteButton = document.getElementById('mute-button')
        this.micOffButton = document.getElementById('mic-off-button')
        this.camOffButton = document.getElementById('cam-off-button')
        this.muteButtonBoolean = false
        this.micOffButtonBoolean = false  
        this.camOffButtonBoolean = false
        this.init()
    }

    init() {
        this.muteButton.addEventListener('click', () => {
            const elems = document.querySelectorAll("video, audio")
            if(!this.muteButtonBoolean) {
                for(let i = 0; i < elems.length; i++) {
                    elems[i].muted = true
                }
                this.muteButtonBoolean = true
                this.muteButton.removeChild(this.muteButton.children[0])
                this.muteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="red" class="bi bi-volume-off" viewBox="0 0 16 16"><path d="M10.717 3.55A.5.5 0 0 1 11 4v8a.5.5 0 0 1-.812.39L7.825 10.5H5.5A.5.5 0 0 1 5 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zM10 5.04 8.312 6.39A.5.5 0 0 1 8 6.5H6v3h2a.5.5 0 0 1 .312.11L10 10.96V5.04z"/></svg>'
            }
            else {
                for(let i=0; i < elems.length; i++) {
                    elems[i].muted = false
                }
                document.getElementById("snapdragon").muted = true;

                this.muteButtonBoolean = false
                this.muteButton.removeChild(this.muteButton.children[0])
                this.muteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="green" class="bi bi-volume-mute" viewBox="0 0 16 16"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zM6 5.04 4.312 6.39A.5.5 0 0 1 4 6.5H2v3h2a.5.5 0 0 1 .312.11L6 10.96V5.04zm7.854.606a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/></svg>'
        }
            
        }) 

        this.micOffButton.addEventListener('click', () => {
            if(!this.micOffButtonBoolean) {
                this.micOffButtonBoolean = true
                this.micOffButton.removeChild(this.micOffButton.children[0])
                this.micOffButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="red" class="bi bi-mic" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/><path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/></svg>'
            } else {
                this.micOffButtonBoolean = false
                this.micOffButton.removeChild(this.micOffButton.children[0])
                this.micOffButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="green" class="bi bi-mic-mute" viewBox="0 0 16 16"><path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879l-1-1V3a2 2 0 0 0-3.997-.118l-.845-.845A3.001 3.001 0 0 1 11 3z"/><path d="m9.486 10.607-.748-.748A2 2 0 0 1 6 8v-.878l-1-1V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/></svg>'
            }
        })

        this.camOffButton.addEventListener('click', () => {
            if(!this.camOffButtonBoolean) {
                this.camOffButtonBoolean = true
                this.camOffButton.removeChild(this.camOffButton.children[0])
                this.camOffButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="red" class="bi bi-camera-video" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z"/></svg>'
            } else {
                this.camOffButtonBoolean = false
                this.camOffButton.removeChild(this.camOffButton.children[0])
                this.camOffButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="green" class="bi bi-camera-video-off" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/> </svg>'
            }
        })
    }
    
    muteButton() {
        if(!this.micOffButtonBoolean) {
            
            
            return true
        }
        else {
           
            return false
        }
    }
}