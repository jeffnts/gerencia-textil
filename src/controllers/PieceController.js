import fs from 'fs'
import path from 'path'
import uuidv1 from 'uuid/v1'


import Piece from '../models/PieceModel'
import Report from '../models/ReportModel'

module.exports = {
  createPiece: async (data) =>{
    try {
      const {name, image, steps } = data

      const imageName = `${uuidv1()}-${image.name}`

      const totalMinutes = steps.reduce((prev, {minutes}) =>{
        return prev + minutes
      }, 0)

      const restMinutes = totalMinutes % 60

      const totalSeconds = steps.reduce((prev, {seconds}) =>{
        return prev + seconds
      }, 0)

      const restSeconds = totalSeconds % 60


      const totalTime = {
        hours: Math.floor(totalMinutes/60),
        minutes: restMinutes + Math.floor(totalSeconds/60),
        seconds: restSeconds
      }

      const piece = Piece.create({
        name,
        image: imageName,
        steps,
        totalTime,
        createdAt: new Date()
      })


      await piece.save()

      fs.copyFile(image.path, path.join(__dirname, '..', 'public', 'images', imageName),error => {
        if(error) {console.log('Houve Um erro')}
        console.log('ok')

      })

      return({
        data: piece,
        message: 'Peça cadastrada com sucesso!'
      })
    }catch (error) {
      console.log(error.message)
      return {message: "Houve um erro ao tentar cadastrar a peça." + error.message}

    }

  },
  getAllPieces: async ( name, sort = '-createdAt', limit=5 ) =>{
    try {
      let query = {}

      if (name) {
        query = {name: new RegExp(escapeRegex(name), 'gi')}
      } else {
        query = {}
      }

      const pieces = await Piece.find(query, {sort})

      return pieces
    }catch (error) {

      return 'Erro ao tentar listar as peças.'

    }

    //Fuzzy search function
    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    }
  },
  getOnePiece: async (id) =>{
    try {
      const piece = await Piece.findOne({_id: id})

      return piece
    }catch (error) {
      return ({
        message: 'Erro ao tentar listar a peça.'
      })
    }
  },
  updatePiece: async (id, data) =>{
    try {
      const { name, steps, imageChange } = data


      const totalMinutes = steps.reduce((prev, {minutes}) =>{
        return prev + minutes
      }, 0)

      const restMinutes = totalMinutes % 60

      const totalSeconds = steps.reduce((prev, {seconds}) =>{
        return prev + seconds
      }, 0)

      const restSeconds = totalSeconds % 60


      const totalTime = {
        hours: Math.floor(totalMinutes/60),
        minutes: restMinutes + Math.floor(totalSeconds/60),
        seconds: restSeconds
      }


      if(!imageChange){
        const piece = await Piece.findOneAndUpdate({_id: id},{
          name,
          image: data.image.name,
          steps,
          totalTime
        })


        return ({
          data: piece,
          message: 'Peça atualizada com sucesso!'
        })
      }else{
        const imageName = `${uuidv1()}-${data.image.name}`

        const piece = await Piece.findOneAndUpdate({_id: id},{
          name,
          image: imageName,
          steps,
          totalTime
        })


        if(data.previousImage !== 'sem-imagem.jpg'){
          const previousImage = `${__dirname}../../public/images/${data.previousImage}`
          fs.unlinkSync(previousImage)
        }

        fs.copyFile(data.image.path, `${__dirname}../../public/images/${imageName}`,error => {
          if(error) {console.log('Houve Um erro')}
          console.log('ok')
        })

        return ({
          data: piece,
          message: 'Peça atualizada com sucesso!'
        })
      }

    }catch (error) {
      return 'Erro ao tentar editar a peça.' + error.message
    }
  },
  removePiece: async (id) =>{
    try {

      const pieceRes = await Piece.findOne({_id: id})

      const reports = await Report.find({'pieces.piece': pieceRes._id}, {pieces:{$elemMatch: {piece: pieceRes._id}}})

      let pieceReports = []
      for( let i = 0; i < reports.length; i++){
        pieceReports.push( await Report.findOne({_id: reports[i]._id}))
      }

      const reportsToBeDeleted = pieceReports.map(({name}) =>{
        return name
      })


      if(reports.length > 0){
        throw {
          error: 'Erro',
          message: 'Não foi possível deletar esta peça, pois elá está cadastrada nos seguintes relatórios: '+ reportsToBeDeleted.toString()
        }
      }else{
        await Piece.deleteOne({_id: id})

        if( pieceRes.image !== 'sem-imagem.jpg'){
          const image = `${__dirname}../../public/images/${pieceRes.image}`
          fs.unlinkSync(image)
        }

        return  'Peça removida com sucesso!'
      }
    }catch (error) {
      return {data: error.message, err: true}
    }

  }
}
