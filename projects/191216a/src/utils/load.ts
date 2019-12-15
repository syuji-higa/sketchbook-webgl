export const loadVideo = ($video: HTMLMediaElement): Promise<void> => {
  return new Promise((resolve) => {
    $video.load()
    $video.addEventListener(
      'canplaythrough',
      () => {
        resolve()
      },
      { once: true }
    )
  })
}

type LoadFunction = {
  done?: Function
  fail?: Function
  always?: Function
}

type LoadImage = {
  img: HTMLImageElement
  isSuccess: boolean
}

export const loadImage = (
  src: string,
  options: LoadFunction = {}
): Promise<LoadImage> => {
  const { done, fail, always } = options

  return new Promise(
    (resolve): void => {
      const _img: HTMLImageElement = new Image()

      const _always: Function = (
        img: HTMLImageElement,
        isSuccess: boolean
      ): void => {
        if (always) {
          always(img)
        }
        resolve({ img, isSuccess })
      }

      _img.onload = (): void => {
        if (done) done(_img)
        _always(_img, true)
      }
      _img.onerror = (): void => {
        if (fail) fail(_img)
        _always(_img, false)
      }

      _img.src = src
    }
  )
}

export const loadFile = (
  file: Blob,
  options: LoadFunction = {}
): Promise<boolean> => {
  const { done, fail, always } = options

  return new Promise(
    (resolve): void => {
      const _reader: FileReader = new FileReader()

      const _always: Function = (
        file_: FileReader,
        isSuccess: boolean
      ): void => {
        if (always) always(file_)
        resolve(isSuccess)
      }

      _reader.onload = (file_): void => {
        if (done) done(file_)
        _always(file_, true)
      }
      _reader.onerror = (file_): void => {
        if (fail) fail(file_)
        _always(file_, false)
      }

      _reader.readAsDataURL(file)
    }
  )
}
