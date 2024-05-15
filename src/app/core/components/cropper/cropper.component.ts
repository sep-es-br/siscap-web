import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';

import { ImageCropperComponent, ImageCroppedEvent, LoadedImage, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbAlertModule,NgbModal  } from '@ng-bootstrap/ng-bootstrap';
import { set } from 'lodash';



@Component({
    standalone: true,
    imports: [ImageCropperComponent,CommonModule,NgbAlertModule],
    selector: 'app-cropper',
    templateUrl: './cropper.component.html',
    styleUrls: ['./cropper.component.scss'],
})
export class CropperComponent {

    private modalService = inject(NgbModal);
    @ViewChild('cropperModal') imageCropper!: ElementRef;
    @ViewChild(ImageCropperComponent) imageCropperComponent!: ImageCropperComponent;
    acceptedTypes: string[] = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif' ];
    urlImage!: string;
    @Input() initialImage?: File;
    @Input() editImage?: boolean;
    imageChangedEvent: Event | null = null;
    croppedImage: SafeUrl  = '';
    @Input()
    croppedImagethumb: any = false;
    @Output() imgcropped = new EventEmitter<any>();
    loading!: boolean;
    editMode: boolean = false;
    canvasRotation: number = 0;
    transform: ImageTransform = {};
    scale: number = 1;
    rotation: number = 0;
    translateH: number = 0;
    translateV:number = 0;
    imagePlaceholder = './assets/images/blank-image.svg';
    modalOptions: any = {
        backdrop: 'static',
        backdropClass: 'customBackdrop',
        centered: true,
        windowClass: 'modal-cropper',
        size: 'lg'
    };
    configCropper: any = {
        maintainAspectRatio: true,
        resizeToWidth: 350,
        cropperMinWidth: 300,
        aspectRatio: 4 / 4,
        format: 'png',
        roundCropper:true,
        containWithinAspectRatio: true,
    }
    file!: File;


    constructor(
      private sanitizer: DomSanitizer
    ) {
        this.modalService.dismissAll();
        
    }

    ngOnInit(): void {
        this.imageInitial();
        if(this.croppedImagethumb == ''){
            this.croppedImagethumb = this.imagePlaceholder;
        }
    }

    imageInitial(){
        if(this.croppedImagethumb){    
            this.editMode = true;        
            const byteString = atob(this.croppedImagethumb.split(',')[1]);
            const mimeType = this.croppedImagethumb.split(',')[0].split(':')[1].split(';')[0];
            const byteArray = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              byteArray[i] = byteString.charCodeAt(i);
            }
            const tempImage = new Blob([byteArray], { type: mimeType });
            const imgUrl = URL.createObjectURL(tempImage);
            this.file = new File([tempImage ], 'image.png', { type: 'image/png' });
            this.urlImage = this.croppedImagethumb;
            this.croppedImage = tempImage;
            let imgs = [];
            imgs.push(this.file);
            imgs.push(imgUrl);
            this.imgcropped.emit(imgs);
        }
    }

    open() {
		this.modalService.open(this.imageCropper,this.modalOptions);
	}
    
    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
        this.open();
    }
    
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');
        this.file = new File([event.base64 || event.blob || ''  ], 'image2.png', { type: 'image/png' });
    }

    imageLoaded(image?: LoadedImage) {
        if(image){
            this.urlImage = image.original.objectUrl;
        }
    }

    cropperReady() {
        this.editMode = true;
    }

    loadImageFailed() {
        // show message
    }

    rotateLeft() {
        setTimeout(() => { // Use timeout because rotating image is a heavy operation and will block the ui thread
            this.canvasRotation--;
            this.flipAfterRotate();
        }, 10);
    }

    rotateRight() {
        this.loading = true;
        setTimeout(() => {
            this.canvasRotation++;
            this.flipAfterRotate();
        }, 10);
    }
    
    flipHorizontal() {
        this.transform = {
            ...this.transform,
            flipH: !this.transform.flipH
        };
    }

    flipVertical() {
        this.transform = {
            ...this.transform,
            flipV: !this.transform.flipV
        };
    }

    resetImage() {
        this.scale = 1;
        this.rotation = 0;
        this.canvasRotation = 0;
        this.transform = {};
    }
    
    zoomOut() {
        this.scale -= .1;
        this.transform = {
            ...this.transform,
            scale: this.scale
        };
    }

    zoomIn() {
        this.scale += .1;
        this.transform = {
            ...this.transform,
            scale: this.scale
        };
    }
    
    private flipAfterRotate() {
        const flippedH = this.transform.flipH;
        const flippedV = this.transform.flipV;
        this.transform = {
            ...this.transform,
            flipH: flippedV,
            flipV: flippedH
        };
    }

    cancelOperation() {
        this.modalService.dismissAll();
        this.resetImage();    
    }

    moveLeft(){
        this.transform = {
            ...this.transform,
            translateH: ++this.translateH
        };
    }

    moveRight(){
        this.transform = {
            ...this.transform,
            translateH: --this.translateH
        };
    }

    moveUp(){
        this.transform = {
            ...this.transform,
            translateV: ++this.translateV
        };
    }

    moveDown(){
        this.transform = {
            ...this.transform,
            translateV: --this.translateV
        };
    }

    crop() {
        this.modalService.dismissAll();
        let imgs = [];
        imgs.push(this.file);
        imgs.push(this.croppedImage);
        this.imgcropped.emit(imgs);
        this.urlImage = this.croppedImage.toString();
        this.croppedImagethumb = this.croppedImage;
    }

    removeImage(){
        this.editMode = false;
        this.croppedImagethumb = this.imagePlaceholder;
        this.imgcropped.emit([]);
    }
    
}