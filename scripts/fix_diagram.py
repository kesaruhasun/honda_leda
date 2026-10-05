import os
import xml.etree.ElementTree as ET

script_dir = os.path.dirname(os.path.abspath(__file__))
diagram_path = os.path.join(script_dir, '..', 'docs', 'PulseOS_ClassDiagram.drawio')
tree = ET.parse(diagram_path)
root = tree.getroot()

sx = 1.4
sy = 2.3

for mxGeometry in root.iter('mxGeometry'):
    if 'x' in mxGeometry.attrib:
        mxGeometry.set('x', str(float(mxGeometry.attrib['x']) * sx))
    if 'y' in mxGeometry.attrib:
        mxGeometry.set('y', str(float(mxGeometry.attrib['y']) * sy))
    if 'width' in mxGeometry.attrib:
        mxGeometry.set('width', str(float(mxGeometry.attrib['width']) * sx))
    if 'height' in mxGeometry.attrib:
        mxGeometry.set('height', str(float(mxGeometry.attrib['height']) * sy))

for mxPoint in root.iter('mxPoint'):
    if 'x' in mxPoint.attrib:
        mxPoint.set('x', str(float(mxPoint.attrib['x']) * sx))
    if 'y' in mxPoint.attrib:
        mxPoint.set('y', str(float(mxPoint.attrib['y']) * sy))

for mxCell in root.iter('mxCell'):
    if mxCell.attrib.get('vertex') == '1':
        style = mxCell.attrib.get('style', '')
        if 'verticalAlign=top' not in style:
            style += 'verticalAlign=top;'
        mxCell.set('style', style)

tree.write(diagram_path)
