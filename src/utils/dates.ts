function getLang() {
    if (navigator.languages !== undefined) 
      return navigator.languages[0]; 
    return navigator.language;
}

export function toLocaleDateString(date: Date): string {
    return date.toLocaleDateString(getLang(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export function dateToString(date: Date) {
    let month = (date.getMonth()+1).toString()
    
    if (+month < 10) {
        month = '0'+month
    }

    let day = (date.getDate()).toString()
    
    if (+day < 10) {
        day = '0'+day
    }
    
    return `${date.getFullYear()}-${month}-${day}`
}