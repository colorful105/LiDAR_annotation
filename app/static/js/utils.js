function calculateMean(arr) {
    var total = 0;
    for (var i = 0; i< arr.length; i++) {
        total += arr[i];
    }
    return total / arr.length;
}

function standardDeviation(arr) {
    var mean = calculateMean(arr);
    var variance = 0;
    for (var i = 0; i < arr.length; i++) {
        variance += Math.pow(arr[i] - mean, 2);
    }
    variance = variance / arr.length;
    return Math.pow(variance, 0.5);
}

function filter(arr, mean, thresh) {
    var result = [];
    for (var i = 0; i< arr.length; i++) {
        if (Math.abs(arr[i] - mean) < thresh) {
            result.push(arr[i]);
        }
    }
    return result;
}

function getMinElement(arr) {
    var min = Number.POSITIVE_INFINITY;
    for (var i = 0; i< arr.length; i++) {
        if (arr[i] < min) {
            min = arr[i];
        }
    }
    return min;
}

function get3DCoord() {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    mouse.z = 0.5;
    mouse.unproject( camera );
    var dir = mouse.sub( camera.position ).normalize();
    var distance = - camera.position.y / dir.y;
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    return pos;
}

function get3DVerticalCoord(box) {
    var a = box.geometry.vertices[5];
    var b = box.geometry.vertices[4];

    var centroid = box.geometry.vertices[5];
    var dir = new THREE.Vector3(a.x-b.x,a.y-b.y,a.z-b.z);
    var plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(dir, centroid).normalize();

    // Create a basic rectangle geometry
    var planeGeometry = new THREE.PlaneGeometry(15, 15);

    // Align the geometry to the plane
    var coplanarPoint = plane.coplanarPoint();
    // console.log("coplanerPoint", coplanarPoint);
    var focalPoint = new THREE.Vector3().copy(coplanarPoint).add(plane.normal);
    planeGeometry.lookAt(focalPoint);
    // planeGeometry.translate(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);

    // Create mesh with the geometry
    var planeMaterial = new THREE.MeshBasicMaterial({color:0x00ff33,
        side: THREE.DoubleSide, transparent: true, opacity: 0});
    var dispPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    dispPlane.position.set(a.x, a.y, a.z);
    scene.add(dispPlane);

    return dispPlane;
}

// 3D intersection to plane using for reheight
function get3DIntersectPlane() {
    var mouse = new THREE.Vector3();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObject(dispPlane);
//     console.log("intersects", intersects);
    mouse.z = intersects[0].point.y;


    return mouse;

}

// 3D intersection to point
function get3DIntersect() {

    var mouse = new THREE.Vector2();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    for (var i = 0; i < boundingBoxes.length; i++) {
        var box = boundingBoxes[i];
        var intersects = raycaster.intersectObject(box.points);
        if (intersects.length != 0) {
            break
        }
    }
    if (intersects.length == 0) {
        return {intersect: null, idx: null};
    }
    // return intersect object and index of the bounding box
    return {intersect: intersects[0], idx: i};
}

function getMaxElement(arr) {
    var max = Number.NEGATIVE_INFINITY;
    for (var i = 0; i< arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}

function getMin(v1, v2) {
    return new THREE.Vector3(Math.min(v1.x, v2.x), // y로 ui 상에 표기
                             Math.min(v1.y, v2.y),
                             Math.min(v1.z, v2.z)) // x로 ui 상에 표기
}

function getMax(v1, v2) {
    return new THREE.Vector3(Math.max(v1.x, v2.x), // y로 ui 상에 표기
                             Math.max(v1.y, v2.y), 
                             Math.max(v1.z, v2.z)) // x로 ui 상에 표기
}

function getTopLeft(v1, v2) {
    return new THREE.Vector3(Math.min(v1.x, v2.x), // y로 ui 상에 표기
                             Math.max(v1.y, v2.y), 
                             Math.max(v1.z, v2.z)) // x로 ui 상에 표기
}

function getBottomRight(v1, v2) {
    return new THREE.Vector3(Math.max(v1.x, v2.x), // y로 ui 상에 표기
                             Math.min(v1.y, v2.y), 
                             Math.min(v1.z, v2.z)) // x로 ui 상에 표기
}

function getCenter(v1, v2) {
    return new THREE.Vector3((v1.x + v2.x) / 2.0, 0.0, (v1.z + v2.z) / 2.0);
}

function rotate(v1, v2, angle) {
    center = getCenter(v1, v2);
    v1.sub(center);
    v2.sub(center);
    var temp1 = v1.clone();
    var temp2 = v2.clone();
    v1.x = Math.cos(angle) * temp1.x - Math.sin(angle) * temp1.z;
    v2.x = Math.cos(angle) * temp2.x - Math.sin(angle) * temp2.z;

    v1.z = Math.sin(angle) * temp1.x + Math.cos(angle) * temp1.z;
    v2.z = Math.sin(angle) * temp2.x + Math.cos(angle) * temp2.z;

    v1.add(center);
    v2.add(center);
}

function getOppositeCorner(idx) {
    if (idx == 0) {return 1;}
    if (idx == 1) {return 0;}
    if (idx == 2) {return 3;}
    return 2;
}

function containsPoint(box, v) {
    var center = getCenter(box.boundingBox.max, box.boundingBox.min);
    var diff = v.clone();
    diff.sub(center);
    var v1 = v.clone();
    var v2 = center;
    v2.sub(diff);
    rotate(v1, v2, box.angle);
    return box.boundingBox.containsPoint(v2);
}


function intersectWithCorner() {
    if (boundingBoxes.length == 0) {
        return null;
    }
    var closestBox = null;
    var closestCorner = null;
    var shortestDistance = Number.POSITIVE_INFINITY;
    for (var i = 0; i < boundingBoxes.length; i++) {
        var b = boundingBoxes[i];
        var intersection = getIntersection(b);
        if (intersection) {
            if (intersection.distance < shortestDistance) {
                closestBox = b;
                closestCorner = intersection.point;
                shortestDistance = intersection.distance;
            }
        }
    }
    if (closestCorner) {
        return [closestBox, closestCorner];
    } else {
        return null;
    }
}

function getIntersection(b) {
    var temp = new THREE.Vector3(mouse2D.x, mouse2D.y, 0);
    temp.unproject( camera );
    var dir = temp.sub( camera.position ).normalize();
    var distance = - camera.position.y / dir.y;
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    var shortestDistance = Number.POSITIVE_INFINITY;
    var closestCorner = null;
    for (var i = 0; i < b.geometry.vertices.length; i++) {
        if (distance2D(pos, b.geometry.vertices[i]) < shortestDistance &&
            distance2D(pos, b.geometry.vertices[i]) < b.get_cursor_distance_threshold()) {
            shortestDistance = distance2D(pos, b.geometry.vertices[i]);
            closestCorner = b.geometry.vertices[i];
        }
    }
    if (closestCorner == null) {
        return null;
    }
    return {distance: shortestDistance, point: closestCorner};
}

function distance2D(v1, v2) {
    return Math.pow(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.z - v2.z, 2), 0.5)
}
  
function closestPoint(p, vertices) {
    var shortestDistance = Number.POSITIVE_INFINITY;
    var closestIdx = null;
    for (var i = 0; i < vertices.length; i++) {
        if (p.distanceTo(vertices[i]) < shortestDistance) {
            shortestDistance = p.distanceTo(vertices[i]);
            closestIdx = i;
        }
    }
    // console.log(closestIdx);
    return closestIdx;
}

function save() {
  alert("Saving to json");
  var outputBoxes = [];
  // 이부분으로 파일명 읽어옴
  var x = document.getElementById("file_input");
    if (x.files.length > 0) {
        for (var i = 0; i < x.files.length; i++) {
            var filename = x.files[i].name;
        }
    }
    // 읽은 파일 명 .bin 앞에까지만 끊음
  var thisfilename = filename.substring(filename.lastIndexOf('.'), 0);
  for (var i = 0; i < boundingBoxes.length; i++) {
    outputBoxes.push(new OutputBox(boundingBoxes[i]));
  }
  var values = outputBoxes.map(function (item) {
      return Object.values(item);
  });
  var stringifiedOutput = JSON.stringify(values);
  stringifiedOutput = stringifiedOutput.replace(/"+/g, '');
  stringifiedOutput = stringifiedOutput.replace(/],/g, '\n');
  stringifiedOutput = stringifiedOutput.replace(/]/g, '');
  stringifiedOutput = stringifiedOutput.replace(/\[/g, '');
  stringifiedOutput = stringifiedOutput.replace(/,/g, " ");
  stringifiedOutput = stringifiedOutput.replace(/-?\d+(\.\d+)?/g, function(match) {
      return Number(match).toFixed(2);
  });
  stringifiedOutput = stringifiedOutput.replace(/null/g, 0);
  var file = new File([stringifiedOutput], thisfilename.toString()+".txt", {type: "/txt;charset=utf-8"});
  saveAs(file);
}
//
// function upload_file() {
//     var x = document.getElementById("file_input");
//     if (x.files.length > 0) {
//         reset();
//         var file = x.files[0];
//         load_text_file(file, import_annotations_from_bin);
//         evaluator.resume_3D_time();
//         evaluator.resume_time();
//         $("#record").show();
//         isRecording = true;
//     }
// }

var fileLoaded = true;
var currFile = "";
function upload_files() {
    var x = document.getElementById("file_input");
    if (x.files.length > 0) {
        for (var i = 0; i < x.files.length; i++) {
            var filename = x.files[i].name;
            var file = x.files[i];
            evaluation.add_filename(filename);
        }
        var text_reader = new FileReader();
        load_data_helper(0, x.files);
    }
}

function load_data_helper(index, files) {
    if (index < evaluation.filenames.length) {
    // if (index < evaluation.filenames.length) {
        load_text_file(index, files[index], files);
    }
}


function import_annotations_from_bin(data) {
  if ( data === '' || typeof(data) === 'undefined') {
    return;
  }
}


function load_text_file(index, text_file, files) {
  if (text_file) {
    var text_reader = new FileReader();
    text_reader.readAsArrayBuffer(text_file);
    text_reader.onload = function() {
        readData(text_reader);
        load_data_helper(index + 1, files);
    }
  }
}

function readData(text_reader) {
    var rawLog = text_reader.result;
    var floatarr = new Float32Array(rawLog)
    evaluation.add_data(floatarr);
    if (evaluation.num_frames() == 1) {
        reset();
        data = evaluation.get_data();
        // getMaskRCNNLabels(evaluation.get_filename());
        show();
        animate();
        // $.ajax({
        //     url: '/initTracker',
        //     data: JSON.stringify({pointcloud: pointcloud.geometry.vertices}),
        //     type: 'POST',
        //     contentType: 'application/json;charset=UTF-8',
        //     success: function(response) {
        //         console.log(response);
        //     },
        //     error: function(error) {
        //         console.log(error);
        //     }
        // });
        // evaluator.resume_3D_time();
        // evaluator.resume_time();
        $("#record").show();
        isRecording = false;
        // $("#file_input").hide();
        select2DMode();
    }
}



// https://stackoverflow.com/a/15327425/4855984
String.prototype.format = function(){
    var a = this, b;
    for(b in arguments){
        a = a.replace(/%[a-z]/,arguments[b]);
    }
    return a; // Make chainable
};