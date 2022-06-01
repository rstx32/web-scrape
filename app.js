import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const scrapeData = async (url) => {
  try {
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    const html = $('body')
    const temp = {
      name: '',
      nim: '',
    }

    html.each((index, element) => {
      const x = $(element).find('td')
      for (let index = 0; index < x.length; index++) {
        if (
          $(x[index]).text() === 'DOSCOM' &&
          $(x[index + 2]).text() === '2019-2020'
        ) {
          temp.name = $(x[2]).text()
          temp.nim = $(x[5]).text()
          console.log(`${$(x[2]).text()} anggota doscom!`)
        }
      }
    })

    if (temp.name !== '' && temp.nim !== '') return temp
    else {
      console.log(`${url} bukan anggota doscom!`)
      return null
    }
  } catch (error) {
    console.log(error)
  }
}

const getDoscomMembers = async (startNIM, endNIM, year) => {
  const dataDoscom = []
  for (let index = startNIM; index < endNIM; index++) {
    const dinusURL = `https://dinus.ac.id/mahasiswa/A11.${year}.${index}`
    const mhs = await scrapeData(dinusURL)

    if (mhs !== null) {
      dataDoscom.push(mhs)
    }
    console.log(dataDoscom)
  }
  fs.writeFileSync('doscom-2018.json', JSON.stringify(dataDoscom))
}

// fetch semua angkatan mahasiswa udinus
const getAngkatan = async (startNIM, endNIM, angkatan) => {
  let dataAngkatan = []
  for (let nim = startNIM, stop = 0; nim < endNIM; nim++) {
    const url = `https://dinus.ac.id/mahasiswa/A11.${angkatan}.${nim}`
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)
    const html = $('body')
    const temp = {
      name: '',
      nim: '',
    }

    html.each((index, element) => {
      const x = $(element).find('td')
      if ($(x[2]).text() !== '') {
        console.log(`${nim} - ` + $(x[2]).text())
        temp.name = $(x[2]).text()
        temp.nim = $(x[5]).text()
        stop = 0
      } else {
        console.log(`${nim} bukan angkatan ${angkatan}`)
      }
    })
    
    if (temp.name !== '' && temp.nim !== '') {
      dataAngkatan.push(temp)
    }

    if (stop > 20) {
      break
    }
  }

  fs.writeFileSync(`angkatan-${angkatan}.json`, JSON.stringify(dataAngkatan))
}

// angkatan 2017
// nim start : 10055
// nim stop : 10831

// angkatan 2018
// nim start : 10842
// nim stop : 11615

// getDoscomMembers(10055, 10831, 2017)
// getAngkatan(10055, 10831, 2017)
