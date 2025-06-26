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
    
    
    const testJSON = {
    "icon": "/assets/home_mindtrails.png",
    "home": {
        "title": "MindTrails",
        "elements": [
            {
                "type": "alert",
                "title": "Alert title",
                "message": "Alert message",
                "icon": {
                    "url": "/assets/home_banner.png",
                    "tint": false
                }
            },
            {
                "type": "sessions",
                "left": {
                    "text": "{0} Sessions Completed",
                    "icon": "/assets/completed.png"
                },
                "right": {
                    "text": "Launch Session",
                    "icon": "/assets/unlocked.png",
                    "action": "flow://flows/doses"
                }
            },
            {
                "type": "button",
                "action": {
                    "text": "Show Survey Modal",
                    "action": "navmodal://Survey"
                }
            },
            {
                "type": "carousel",
                "actions": [
                    {
                        "text": "inputs!",
                        "icon": "/assets/home_mindtrails.png",
                        "action": "flow://flows/inputs",
                        "backgroundcolor": "#1A206AFF",
                        "markcompleted": true
                    },
                    {
                        "text": "survey 1",
                        "icon": "/assets/home_instructions.png",
                        "action": "flow://flows/how was your day?",
                        "backgroundcolor": "#1A00E05A",
                        "markcompleted": true
                    },
                    {
                        "text": "survey 2",
                        "icon": "/assets/home_resources.png",
                        "action": "flow://flows/survey2",
                        "backgroundcolor": "#1A00C2FF",
                        "markcompleted": true
                    },
                    {
                        "text": "survey 3",
                        "icon": "/assets/home_anxiety.png",
                        "action": "flow://flows/survey3",
                        "backgroundcolor": "#1A5C2FDA",
                        "markcompleted": true
                    }
                ]
            },
            {
                "type": "tiles",
                "actions": [
                    {
                        "text": "inputs!",
                        "icon": "/assets/home_mindtrails.png",
                        "action": "flow://flows/inputs",
                        "backgroundcolor": "#1A206AFF",
                        "markcompleted": true
                    },
                    {
                        "text": "survey 1",
                        "icon": "/assets/home_instructions.png",
                        "action": "flow://flows/how was your day?",
                        "backgroundcolor": "#1A00E05A",
                        "markcompleted": true
                    },
                    {
                        "text": "survey 2",
                        "icon": "/assets/home_resources.png",
                        "action": "flow://flows/survey2",
                        "backgroundcolor": "#1A00C2FF",
                        "markcompleted": true
                    },
                    {
                        "text": "survey 3",
                        "icon": "/assets/home_anxiety.png",
                        "action": "flow://flows/survey3",
                        "backgroundcolor": "#1A5C2FDA",
                        "markcompleted": true
                    }
                ]
            }
        ]
    },
    "menu": [
        {
            "text": "Home",
            "icon": "/assets/menu_home.png"
        }
    ],
    "triggers": [
        {
            "type": "timing",
            "action": "notification",
            "content": "flow://flows/how was your day?",
            "frequency": "00:05:00"
        },
        {
            "type": "timing",
            "action": "notification",
            "content": "flow://flows/survey2",
            "frequency": "01:00:00"
        },
        {
            "type": "timing",
            "action": "notification",
            "content": "flow://flows/survey3",
            "frequency": "1",
            "time": "08:00"
        }
    ],
    "probes": [
        {
            "type": "Location",
            "optional": true,
            "interval": "00:00:01",
            "accuracy": 5
        }
    ]
}
this.fileService.fetchAndDecodeJson().subscribe({
    next: (decodedJson) => { // MUNEER use decodedJson to populate the UI if you can
      console.log('✅ Decoded JSON:', decodedJson);
      this.fileService.updateFile(JSON.stringify(testJSON), "testing JSON update").subscribe({ // should run updateFile after fetchAndDecodeJson's next block
        next: (response) => {
          console.log('File updated successfully:', response);
        },
        error: (error) => {
          console.error('Error updating file:', error);
        }
      });
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