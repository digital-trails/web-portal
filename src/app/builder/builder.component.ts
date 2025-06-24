// builder.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { fileService } from './file-service.service';

@Component({
  selector: 'app-builder',
  standalone: false,
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.css']
})
export class BuilderComponent implements OnInit {
  appForm: FormGroup;
  
  // Simple data structure for the phone preview
  appData = {
    title: "My App",
    subtitle: "App Builder Demo",
    button1: "Button 1",
    button2: "Button 2", 
    button3: "Button 3",
    button4: "Button 4"
  };

  constructor(private fb: FormBuilder, private fileService: fileService) {
    this.appForm = this.createForm();
  }

  ngOnInit(): void {
    this.fileService.fetchAndDecodeJson().subscribe({
    next: (decodedJson) => {
      console.log('✅ Decoded JSON:', decodedJson);
      // You can now call updateFile() using this.githubService.updateFile()
    },
    error: (err) => console.error('❌ Error fetching and decoding:', err)
  });
    // Subscribe to form changes for real-time updates
    this.appForm.valueChanges.subscribe((value) => {
      this.updateAppData(value);
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: [this.appData.title],
      subtitle: [this.appData.subtitle],
      button1: [this.appData.button1],
      button2: [this.appData.button2],
      button3: [this.appData.button3],
      button4: [this.appData.button4]
    });
  }

  updateAppData(formValue: any): void {
    this.appData.title = formValue.title || "My App";
    this.appData.subtitle = formValue.subtitle || "App Builder Demo";
    this.appData.button1 = formValue.button1 || "Button 1";
    this.appData.button2 = formValue.button2 || "Button 2";
    this.appData.button3 = formValue.button3 || "Button 3";
    this.appData.button4 = formValue.button4 || "Button 4";
  }

  exportConfig(): void {
    console.log('Current App Data:', JSON.stringify(this.appData, null, 2));
  }
}