import React, { Component } from 'react'
import autoBind from 'react-autobind'
import styled from 'styled-components'

import Draggable from "react-draggable"

import OptionsDrawer from "./Drawer"
import Webcam from "./webcam"
import Button from "./overlayButton"

import toggleFullScreen from "./toggleFullScreen"

import * as PNGS from "./PNGS"

const DragWraper = styled.div`
	width: 100%;
	height: 100%;
	
	${({ isDragging }) => isDragging ? "" : "transition: transform 0.5s ease-in-out;"}
`

const GUI = styled.div`
	position: absolute;
	overflow: hidden;
	pointer-events: none;

	width: 100vw;
	height: 56.25vw;

	max-width: 177.78vh;
	max-height: 100vh;

	transition: opacity 0.5s ease-in-out;

	opacity: ${({ show }) => show ? 0.9 : 0};
`

const ButtonRight = styled(Button)`
	position: absolute;
	top: 50%;
	left: 100%;
`

const ButtonRightBot = styled(Button)`
	top: 100%;
	left: 100%;
`

const ButtonBot = styled(Button)`
	top: 100%;
	left: 50%;
`

export default class GuiOverlay extends Component {
	constructor(props) {
		super(props)
		autoBind(this)

		this.fillStyle = "#0000FF"
		this.strokeStyle = "#0000FF"

		this.camRef = React.createRef()

		this.dragDirection = ""

		this.hideOptionsDrawerPos = { x: 0, y: 0 }
		this.showOptionsDrawerPos = { x: 0, y: 0 }
		this.dragBounds = { left: 0, right: 0 }

		this.state = {
			showWebcam: false,
			showOptionsDrawer: false,
			optionsDrawerPos: null,
			camCapture: null,
			isDragging: false,
			draggable: true,
			dragAt: 0
		}
	}

	calculatepositions() {
		this.showOptionsDrawerPos = { x: -this.props.htmlCanvas.offsetWidth * 0.20, y: 0 }
		this.hideOptionsDrawerPos = { x: 0, y: 0 }
		this.dragBounds = {
			left: this.showOptionsDrawerPos.x,
			right: this.hideOptionsDrawerPos.x
		}
		this.setState({ optionsDrawerPos: this.hideOptionsDrawerPos })
	}

	componentDidMount() {
		window.addEventListener("resize", this.calculatepositions)
	}

	componentWillUnmount() {
		window.removeEventListener("resize", this.calculatepositions)
	}

	componentDidUpdate() {
		this.props.htmlCanvas && !this.state.optionsDrawerPos && this.calculatepositions()
	}

	render() {
		return (
			<GUI
				show={this.props.show}>
				<Draggable
					disabled={!this.state.draggable}
					axis="x"
					onDrag={this.handleDrag}
					onStop={this.handleDragStop}
					position={this.state.optionsDrawerPos}
					bounds={this.dragBounds}>
					<DragWraper
						isDragging={this.state.isDragging}>
						<ButtonRight
							clickable={this.props.show}>
							<PNGS.Arrow
								invert={this.state.dragAt}
								isDragging={this.state.isDragging}/>
						</ButtonRight>
						<OptionsDrawer
							setDraggable={this.setDraggable}
							clickable={this.props.show}
							canvas={this.props.canvas}
							toggleWebcam={this.toggleWebcam} />
					</DragWraper>
				</Draggable>
				{ this.state.showWebcam && <Webcam getRef={ this.camRef } /> }
				<ButtonRightBot
					clickable={this.props.show}
					onClick={toggleFullScreen}>
					{PNGS.FullScreen}
				</ButtonRightBot>
				<ButtonBot
					clickable={this.props.show}
					onClick={this.takePicture}
					download='canvas'>
					{
						this.state.showWebcam ?
							PNGS.Camera
							:
							PNGS.Download
					}
				</ButtonBot>
			</GUI>
		)
	}

	setDraggable(state) {
		this.setState({ draggable: state })
	}

	handleDrag(event, data) {
		if (!this.state.isDragging) {
			this.setState({ isDragging: true })
		}
		if (data.deltaX != 0) {
			this.dragDirection = data.deltaX
		}
		this.setState({ dragAt: data.x / this.showOptionsDrawerPos.x })
	}

	handleDragStop(event) {
		this.setState({ isDragging: false })
		if (this.dragDirection > 0) {
			this.dragDirection = 0
			return this.showOptionsDrawer(false)
		}
		if (this.dragDirection < 0) {
			this.dragDirection = 0
			return this.showOptionsDrawer(true)
		}
		if (this.dragDirection == 0 && event.type == "mouseup") {
			this.showOptionsDrawer(!this.state.showOptionsDrawer)
		}
	}

	showOptionsDrawer(state) {
		this.setState({
			optionsDrawerPos:
				state ?
					this.showOptionsDrawerPos
					:
					this.hideOptionsDrawerPos,
			showOptionsDrawer: state,
			dragAt: state ? 1 : 0
		})
	}

	toggleWebcam() {
		this.setState({
			showWebcam: !this.state.showWebcam
		})
	}

	takePicture(event) {
		if (this.state.showWebcam) {
			event.preventDefault()
			this.captureWebcam()
		} else {
			this.saveCanvas(event)
		}
	}

	saveCanvas(event) {
		const imgURL = this.props.htmlCanvas.toDataURL('image/png')
		event.target.href = imgURL
	}

	captureWebcam() {
		this.props.canvas.ownBrush.Image = this.camRef.current.getScreenshot()
		this.setState({
			showWebcam: !this.state.showWebcam
		})
	}
}